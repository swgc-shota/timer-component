import './style.css';
import van from 'vanjs-core';
import { CountdownTimer } from './countdown-timer';

van.add(document.body, CountdownTimer({ initialSeconds: 2 }));
