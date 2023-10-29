# SofaJS
Yet another JavaScript library for reading SOFA files and creating ConvolverNode for WebAudio API.
It largely depends on [jsfive](https://github.com/usnistgov/jsfive/).
Repository contains all dependencies all you need, it can be easly used in your browser and web application.

## Usage
It reads SOFA files from arrayBuffer, which can be obtained with [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) or [File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API).
It generates ConvolverNode for processing audio data, see [ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode)

### Importing a module
It is ES6 style module for clientside JavaScript, so you may need 
```
<script type="module" src="your-js-file.js"></scriipt>
```
 on your html source.


```
import { Sofa } from "./trueSofa.js"

```

### Getting SOFA file (Example)
```
var file = await fetch("yourSofaFile.sofa");  // Assume, sofa file is on your server.
var buffer = file.arrayBuffer();
```

### Reading an array buffer
```
var Sofa = Sofa(buffer);  // Depends on file size, it takes few seconds.
```

### Methods
```
var Phi = 90 Theta = 45, Radius = 0.5;  // Source Position you want. Usually, Degreee, Degree, Meter

var IR[L,R] = Sofa.getFilter(Phi, Theta, Radius);  // To get simple array of Impulse Response data of closest coordinate.

var AudioCTX = new AudioContext();  


var convolver = getFilterConvolverNode(Phi,Theta,Radius,AudioCTX);  // Given your AudioContext, you can obtain ConvolverNode which can be used for filtering audio.

convonlver.buffer = getFilterAudioBuffer(Phi,Theta,Radius,AudioCTX);  //  Geting audio buffer.

```

### Getters
```
Sofa.SamplingRate
// The followin two gettes, should be used after you call is methods.
Sofa.CurrentIndex;
Sofa.CurrentSourcePosition;
```
