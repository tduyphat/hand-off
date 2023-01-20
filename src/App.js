import { React, useState, useEffect, useRef } from 'react';
import './App.css';
import { Howl } from 'howler';
import soundURL from './assets/bruh.mp3'

const tf = require('@tensorflow/tfjs');
const mobilenetModule = require('@tensorflow-models/mobilenet');
const knnClassifier = require('@tensorflow-models/knn-classifier');

// const sound = new Howl({
//   src: [soundURL]
// });

// sound.play();

const UNTOUCHED_LABEL = 'untouched';
const TOUCHED_LABEL = 'touched';
const TRAINING_TIMES = 50;

function App() {

  const [guideText, setGuideText] = useState('');

  const video = useRef();
  const model = useRef();
  const classifier = useRef();

  const setupCamera = () => {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: true },
          stream => {
            video.current.srcObject = stream;
            video.current.addEventListener('loadeddata', resolve);
          },
          error => reject(error)
        );
      } else {
        reject();
      }
    });
  }

  const init = async () => {
    console.log('init');
    await setupCamera();
    console.log('setup camera success!');

    model.current = await mobilenetModule.load();
    classifier.current = knnClassifier.create();

    console.log('module loaded');
    setGuideText('Leave your hands off your face and press "Train #1"');
  }

  const train = async (label) => {
    console.log(`[${label}] TRAINING`);
    for (let i = 0; i < TRAINING_TIMES; ++i) {
      console.log(`Progress: ${parseInt((i + 1) / TRAINING_TIMES * 100)} %`);
      await training(label);
    }
  }

  const training = (label) => {
    return new Promise(async (resolve) => {
      const embedding = model.current.infer(
        video.current,
        true
      );
      classifier.current.addExample(embedding, label);
      await sleep(100);
      resolve();
    });
  }

  const sleep = (ms = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    init();

    //cleanup
    return () => {

    }
  }, [])

  return (
    <div className="main">
      <h1 className='guideText'>{guideText}</h1>
      <video ref={video} className='video' autoPlay />
      <div className='control'>
        <button className='btn' onClick={() => train(UNTOUCHED_LABEL)}>Train #1</button>
        <button className='btn' onClick={() => train(TOUCHED_LABEL)}>Train #2</button>
        <button className='btn' onClick={() => { }}>Run</button>
      </div>
    </div>
  );

}

export default App;
