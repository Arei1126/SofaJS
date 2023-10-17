import * as hdf5 from "./jsfive/index.js"

function one2two(array,numberOfSplice){
	var newArray = [];
	while (array.length) newArray.push(array.splice(0, numberOfSplice));
	return newArray;
}


function spherical2cartesian(Phi,Theta,Radius){
	var radTheta = Theta*(1/180)*Math.PI;
	var radPhi = Phi*(1/180)*Math.PI;
	var x = Radius*Math.cos(radTheta)*(Math.cos(radPhi));
	var y = Radius*Math.cos(radTheta)*Math.sin(radPhi);
	var z = Radius*Math.sin(radTheta);
	return [x,y,z]
	}

function SofaGetClosestPosition(Phi,Theta,Radius,positionList){
	var closestIndex = 0;
	var closestDistance = Infinity;
	let [x,y,z] = spherical2cartesian(Phi, Theta, Radius);

	positionList.forEach((pos,index) => {
		let [targetX,targetY,targetZ] = spherical2cartesian(pos[0], pos[1], pos[2]);
		let currentDistance =  Math.pow(x-targetX,2) + Math.pow(y-targetY,2) + Math.pow(z-targetZ,2);
		if(currentDistance < closestDistance){
			closestIndex = index;
			closestDistance = currentDistance;
		}
	});
	return closestIndex;
}


function convertIR2AudioBuf(audioctx,L,R){
	var l = new Float32Array(L);
	var r = new Float32Array(R);
	var buf = audioctx.createBuffer(
		2,  // Number of Channels
		L.length,  // buffer size
		audioctx.sampleRate,  // samplingrate
	);

	buf.copyToChannel(l,0);
	buf.copyToChannel(r,1);
	return buf

}
// using f.keys, you can see the list of variables.

export class Sofa {
	constructor(buffer) {
		this.buffer = buffer;
		this.f = new hdf5.File(this.buffer, "w");
		let sourcePositionPre = this.f.get("SourcePosition").value;
		this.numberOfSourcePositions = this.f.get("M").value.length;
		this.numberOfSamples = this.f.get("N").value.length;
		this.sourcePosition = one2two(sourcePositionPre, 3);
		this.IRs = this.f.get("Data.IR").value;  // this take a few second
		this.currentIndex = undefined;
		}

	getFilter(Phi, Theta, Radius){  // Return simple arrays of Impulse Response data
		let closestIndex = SofaGetClosestPosition(Phi, Theta, Radius, this.sourcePosition);
		this.currentIndex = closestIndex;
		let LStart = closestIndex*this.numberOfSamples*2;
		let RStart = LStart + this.numberOfSamples;
		let L = this.IRs.slice(LStart,RStart);
		let R = this.IRs.slice(RStart,RStart+this.numberOfSamples);
		return [L,R]
	}
	
	getFilterAudioBuffer(Phi,Theta,Radius,AudioCTX){  // Given AudioContexct, return audio buffer of Impulse Response
		let	[L,R] =	this.getFilter(Phi,Theta,Radius);
		return  convertIR2AudioBuf(AudioCTX,L,R);
	}
	getFilterConvolverNode(Phi,Theta,Radius,AudioCTX){  // Given AudioContext, return ConvolverNode
		let buffer = this.getFilterAudioBuffer(Phi, Theta, Radius, AudioCTX);
		let Convolver = AudioCTX.createConvolver();
		Convolver.buffer = buffer;
		return Convolver;
	}

	get CurrentIndex(){
		return this.currentIndex;
	}

	get CurrentSourcePosition(){
		return this.sourcePosition[this.currentIndex];
	}	

	get SamplingRate(){
		return this.f.get("Data.SamplingRate").value;

	}
}
