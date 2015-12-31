////////////////
// RETROSOUND //
////////////////

(function () {
    var ORDERED_NOTES         = [['C0', 16.35], ['C#0', 17.32], ['Db0', 17.32], ['D0', 18.35], ['D#0', 19.45], ['Eb0', 19.45], ['E0', 20.60], ['F0', 21.83], ['F#0', 23.12], ['Gb0', 23.12], ['G0', 24.50], ['G#0', 25.96], ['Ab0', 25.96], ['A0', 27.50], ['A#0', 29.14], ['Bb0', 29.14], ['B0', 30.87], ['C1', 32.70], ['C#1', 34.65], ['Db1', 34.65], ['D1', 36.71], ['D#1', 38.89], ['Eb1', 38.89], ['E1', 41.20], ['F1', 43.65], ['F#1', 46.25], ['Gb1', 46.25], ['G1', 49.00], ['G#1', 51.91], ['Ab1', 51.91], ['A1', 55.00], ['A#1', 58.27], ['Bb1', 58.27], ['B1', 61.74], ['C2', 65.41], ['C#2', 69.30], ['Db2', 69.30], ['D2', 73.42], ['D#2', 77.78], ['Eb2', 77.78], ['E2', 82.41], ['F2', 87.31], ['F#2', 92.50], ['Gb2', 92.50], ['G2', 98.00], ['G#2', 103.83], ['Ab2', 103.83], ['A2', 110.00], ['A#2', 116.54], ['Bb2', 116.54], ['B2', 123.47], ['C3', 130.81], ['C#3', 138.59], ['Db3', 138.59], ['D3', 146.83], ['D#3', 155.56], ['Eb3', 155.56], ['E3', 164.81], ['F3', 174.61], ['F#3', 185.00], ['Gb3', 185.00], ['G3', 196.00], ['G#3', 207.65], ['Ab3', 207.65], ['A3', 220.00], ['A#3', 233.08], ['Bb3', 233.08], ['B3', 246.94], ['C4', 261.63], ['C#4', 277.18], ['Db4', 277.18], ['D4', 293.66], ['D#4', 311.13], ['Eb4', 311.13], ['E4', 329.63], ['F4', 349.23], ['F#4', 369.99], ['Gb4', 369.99], ['G4', 392.00], ['G#4', 415.30], ['Ab4', 415.30], ['A4', 440.00], ['A#4', 466.16], ['Bb4', 466.16], ['B4', 493.88], ['C5', 523.25], ['C#5', 554.37], ['Db5', 554.37], ['D5', 587.33], ['D#5', 622.25], ['Eb5', 622.25], ['E5', 659.26], ['F5', 698.46], ['F#5', 739.99], ['Gb5', 739.99], ['G5', 783.99], ['G#5', 830.61], ['Ab5', 830.61], ['A5', 880.00], ['A#5', 932.33], ['Bb5', 932.33], ['B5', 987.77], ['C6', 1046.50], ['C#6', 1108.73], ['Db6', 1108.73], ['D6', 1174.66], ['D#6', 1244.51], ['Eb6', 1244.51], ['E6', 1318.51], ['F6', 1396.91], ['F#6', 1479.98], ['Gb6', 1479.98], ['G6', 1567.98], ['G#6', 1661.22], ['Ab6', 1661.22], ['A6', 1760.00], ['A#6', 1864.66], ['Bb6', 1864.66], ['B6', 1975.53], ['C7', 2093.00], ['C#7', 2217.46], ['Db7', 2217.46], ['D7', 2349.32], ['D#7', 2489.02], ['Eb7', 2489.02], ['E7', 2637.02], ['F7', 2793.83], ['F#7', 2959.96], ['Gb7', 2959.96], ['G7', 3135.96], ['G#7', 3322.44], ['Ab7', 3322.44], ['A7', 3520.00], ['A#7', 3729.31], ['Bb7', 3729.31], ['B7', 3951.07], ['C8', 4186.0]]
    var NOTES                 = _.zipObject(ORDERED_NOTES);

    var MODULATIONS_STEPS     = 16;
    var MODULATION_DEPTH      = 64;
    var TREMOLO_MAX_FREQUENCY = 20;

    var VIBRATO_MAX_FREQUENCY    = 20;
    var VIBRATO_DEPTH_ADJUSTMENT = 500;

    var NOISE_BASE_FREQUENCY         = 5000;
    var NOISE_BASE_Q                 = -7000;
    var NOISE_PITCH_SHIFT_ADJUSTMENT = 40000;
    var NOISE_NOTE_ADJUSTMENT        = 50;

    var PITCH_SHIFT_ADJUSTMENT = 200;

    var OSC_TYPES = {
        SINE:     'sine',
        SQUARE:   'square',
        SAWTOOTH: 'sawtooth',
        TRIANGLE: 'triangle',
        NOISE:    'noise'
    };

    var FILTER_TYPES = {
        LOWPASS:  'lowpass',
        HIGHPASS: 'highpass',
        BANDPASS: 'bandpass'
    };
    var FILTER_MAX_FREQUENCY         = 5000;
    var FILTER_MODULATION_ADJUSTMENT = 1000;

    var REVERB_LENGTH = 8;
    var REVERB_DECAY = 2;

    var PATTERN_ROW_NOTE_LENGTH = 0.25;

    var PATTERN_NOTE_NOTE       = 0;
    var PATTERN_NOTE_INSTRUMENT = 1;
    var PATTERN_NOTE_LENGTH     = 2;
    var PATTERN_NOTE_VOLUME     = 3;
    var PATTERN_NOTE_EFFECT_1   = 4;
    var PATTERN_NOTE_EFFECT_2   = 5;
    var PATTERN_NOTE_EFFECT_3   = 6;

    var PATTERN_NOTE_EFFECT_NO_EFFECT    = 0;
    var PATTERN_NOTE_EFFECT_GLIDE_ON     = 1;
    var PATTERN_NOTE_EFFECT_GLIDE_OFF    = 2;
    var PATTERN_NOTE_EFFECT_TREMOLO_ON   = 3;
    var PATTERN_NOTE_EFFECT_TREMOLO_OFF  = 4;
    var PATTERN_NOTE_EFFECT_VIBRATO_ON   = 5;
    var PATTERN_NOTE_EFFECT_VIBRATO_OFF  = 6;
    var PATTERN_NOTE_EFFECT_ARPEGGIO_ON  = 7;
    var PATTERN_NOTE_EFFECT_ARPEGGIO_OFF = 8;
    var PATTERN_NOTE_EFFECT_FILTER_ON    = 9;
    var PATTERN_NOTE_EFFECT_FILTER_OFF   = 10;
    var PATTERN_NOTE_EFFECT_REVERB_ON    = 11;
    var PATTERN_NOTE_EFFECT_REVERB_OFF   = 12;

    // normalize AudioContext across browsers
    window.AudioContext = window.AudioContext||window.webkitAudioContext;

    function RetroSound (canvas) {
        this.context     = new AudioContext();
        this.clock       = new WAAClock(this.context);
        this.instruments = [];
        this.output      = this.context.createGain();

        this.output.connect(this.context.destination);

        this.clock.start();
    }

    RetroSound.prototype = {
        addInstrument: function (instrument) {
            var amp = this.context.createGain();
            amp.connect(this.output);
            amp.gain.value = 0;

            var tremoloGain = this.context.createGain();
            tremoloGain.connect(amp.gain);
            tremoloGain.gain.value = instrument.tremolo.active ? instrument.tremolo.depth : 0;

            var tremoloOsc = this.context.createOscillator();
            tremoloOsc.type = 'sine';
            tremoloOsc.connect(tremoloGain);
            tremoloOsc.frequency.value = instrument.tremolo.frequency;
            tremoloOsc.start();

            var vibratoGain = this.context.createGain();
            vibratoGain.gain.value = instrument.vibrato.active ? instrument.vibrato.depth * VIBRATO_DEPTH_ADJUSTMENT: 0;

            var vibratoOsc = this.context.createOscillator();
            vibratoOsc.type = 'sine';
            vibratoOsc.connect(vibratoGain);
            vibratoOsc.frequency.value = instrument.vibrato.frequency;
            vibratoOsc.start();

            var filter             = this.context.createBiquadFilter();
            filter.type            = instrument.filter.type;
            filter.frequency.value = instrument.filter.baseFrequency;
            filter.Q.value         = instrument.filter.q;
            filter.gain.value      = instrument.filter.depth;
            filter.connect(amp);

            var reverb = this.context.createConvolver();
            var reverbBuffer = this.context.createBuffer(2, this.context.sampleRate * REVERB_LENGTH, this.context.sampleRate);

            for (var i = 0; i < this.context.sampleRate; i++) {
                reverbBuffer.getChannelData(0)[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / this.context.sampleRate, REVERB_DECAY);
                reverbBuffer.getChannelData(1)[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / this.context.sampleRate, REVERB_DECAY);
            }

            reverb.buffer = reverbBuffer;
            reverb.connect(this.output);

            instrument.amp         = amp;
            instrument.tremoloOsc  = tremoloOsc;
            instrument.tremoloGain = tremoloGain;
            instrument.vibratoOsc  = vibratoOsc;
            instrument.vibratoGain = vibratoGain;
            instrument.filterNode  = filter;
            instrument.reverb      = reverb;
            instrument.playingNote = null;

            this.instruments.push(instrument);
        },

        addInstruments: function (instruments) {
            var self = this;

            _.each(instruments, function (i) { self.addInstrument(i); });
        },

        generateDefaultInstrument: function () {
            return {
                oscillatorType: RetroSound.OSC_TYPES.SINE,
                tuning:         0,
                finetuning:     0,
                finetuning:     0,
                volume:         _.times(MODULATIONS_STEPS, function () { return (MODULATION_DEPTH / 2) * (1 / MODULATION_DEPTH); }),
                pitch:          _.times(MODULATIONS_STEPS, function () { return (MODULATION_DEPTH / 2) * (1 / MODULATION_DEPTH); }),
                glide:         false,
                tremolo: {
                    active:    false,
                    depth:     (MODULATION_DEPTH / 2) * (1 / MODULATION_DEPTH),
                    frequency: TREMOLO_MAX_FREQUENCY / 2
                },
                vibrato: {
                    active:    false,
                    depth:     (MODULATION_DEPTH / 2) * (1 / MODULATION_DEPTH),
                    frequency: VIBRATO_MAX_FREQUENCY / 2
                },
                arpeggio: {
                    active:    false,
                    notes:     [0, 0, 0, 0],
                    speed:     3
                },
                filter: {
                    active:        false,
                    type:          FILTER_TYPES.LOWPASS,
                    baseFrequency: 500,
                    frequencies:   _.times(MODULATIONS_STEPS, function () { return (MODULATION_DEPTH / 2) * (1 / MODULATION_DEPTH); }),
                    q:             100,
                    depth:         500
                },
                effects: {
                    reverb: false
                }
            };
        },

        anticlickAdjustment: function (noteTime) {
            if (noteTime >= 0.3) return 0.0047;
            else if (noteTime >= 0.2) return 0.0047;
            else if (noteTime >= 0.14) return 0.0048;
            else if (noteTime >= 0.13) return 0.0049;
            else if (noteTime >= 0.125) return 0.005;
            else if (noteTime >= 0.11) return 0.0051;
            else if (noteTime >= 0.10) return 0.0052;
            else if (noteTime >= 0.09) return 0.007;
            else if (noteTime >= 0.07) return 0.010;
            else if (noteTime >= 0.062) return 0.016
            else if (noteTime >= 0.06) return 0.015;
            else if (noteTime >= 0.05) return 0.016;
            else return 0.020;
        },

        playNote: function (noteData) {
            var instrument    = noteData.instrument;
            var note          = noteData.note;
            var time          = noteData.time;
            var bpm           = noteData.bpm;
            var doneCallback  = noteData.doneCallback;
            var arpeggio      = noteData.arpeggio;
            var startTime     = noteData.startTime !== undefined ? noteData.startTime : this.context.currentTime;
            var timeInSeconds = time / 1000;
            var stopTime      = startTime + timeInSeconds;
            var forceStop     = noteData.last;
            var dontStop      = noteData.dontStop;

            var self = this;

            var currentNoteIndex = _.findIndex(ORDERED_NOTES, function (n) { return n[0] === note; });


            if (instrument.tuning !== 0) {
                note = ORDERED_NOTES[currentNoteIndex + instrument.tuning][0];
            }

            var initialPitchShift = ((-0.5 + instrument.pitch[0]) * PITCH_SHIFT_ADJUSTMENT);
            var noteFrequency     = NOTES[note] + instrument.finetuning + initialPitchShift;

            var anticlick = this.anticlickAdjustment(timeInSeconds);

            if (instrument.oscillatorType === 'noise') {
                initialPitchShift = ((-0.5 + instrument.pitch[0]) * NOISE_PITCH_SHIFT_ADJUSTMENT);
                noteFrequency = ((NOTES[note] * NOISE_NOTE_ADJUSTMENT) + initialPitchShift) + NOISE_BASE_FREQUENCY
            }

            var oscillator;

            if (instrument.glide && instrument.playingNote !== null && instrument.playingNote !== undefined) {
                oscillator = instrument.playingNote;
                console.log(instrument.playingNote.frequency.value);
                console.log(noteFrequency);
                instrument.playingNote.frequency.value = noteFrequency;
            } else {

                if (instrument.oscillatorType !== 'noise') {
                    oscillator                 = this.context.createOscillator();
                    oscillator.type            = instrument.oscillatorType;
                    oscillator.frequency.value = noteFrequency;

                    oscillator.connect(instrument.filter.active ? instrument.filterNode : instrument.amp);
                } else {
                    var bufferSize  = 2 * this.context.sampleRate;
                    var noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
                    var output      = noiseBuffer.getChannelData(0);

                    var biquadFilter = this.context.createBiquadFilter();
                    biquadFilter.type = 'lowpass';
                    biquadFilter.connect(instrument.filter.active ? instrument.filterNode : instrument.amp);

                    _.times(bufferSize, function (i) { output[i] = Math.random() * 2 - 1; });

                    oscillator           = this.context.createBufferSource();
                    oscillator.buffer    = noiseBuffer;
                    oscillator.loop      = true;
                    oscillator.frequency = biquadFilter.frequency;
                    oscillator.connect(biquadFilter);

                    oscillator.frequency.value = noteFrequency;
                    biquadFilter.Q.value       = NOISE_BASE_Q;
                }

                instrument.playingNote = oscillator;

                // setup reverb
                if (instrument.effects.reverb) {
                    instrument.amp.disconnect();
                    instrument.amp.connect(instrument.reverb);
                } else {
                    instrument.amp.disconnect();
                    instrument.amp.connect(this.output);
                }

                // setup the filter
                instrument.filterNode.type = instrument.filter.type;
                instrument.filterNode.frequency.setValueAtTime(instrument.filter.baseFrequency, startTime);
                instrument.filterNode.Q.setValueAtTime(instrument.filter.q, startTime);
                instrument.filterNode.gain.setValueAtTime(instrument.filter.depth, startTime);

                oscillator.start(startTime);

                // initial volume ramp up
                instrument.amp.gain.setValueAtTime(0, startTime);
                instrument.amp.gain.linearRampToValueAtTime(instrument.volume[0], startTime + anticlick);

                // toggle tremolo and setup
                instrument.tremoloOsc.frequency.value = instrument.tremolo.frequency
                instrument.tremoloGain.gain.setValueAtTime(0, startTime);
                instrument.tremoloGain.gain.linearRampToValueAtTime(instrument.tremolo.active ? instrument.tremolo.depth : 0, startTime + anticlick);

                // setup vibrato
                if (instrument.vibrato.active && !instrument.arpeggio.active) {
                    instrument.vibratoOsc.frequency.value = instrument.vibrato.frequency;

                    instrument.vibratoGain.gain.setValueAtTime(0, startTime);
                    instrument.vibratoGain.gain.linearRampToValueAtTime(instrument.vibrato.active ? instrument.vibrato.depth * VIBRATO_DEPTH_ADJUSTMENT: 0, startTime + anticlick);

                    instrument.vibratoGain.connect(oscillator.frequency);
                }

                if (instrument.arpeggio.active) {
                    var arpeggioNoteTime = ((1000 / (bpm / 60)) * (1 / Math.pow(2, instrument.arpeggio.speed))) / 1000;
                    var arpeggioSteps    = timeInSeconds / arpeggioNoteTime;
                    var arpeggioNotes    = _.flatten(_.times(Math.ceil(arpeggioSteps / instrument.arpeggio.notes.length), function () { return instrument.arpeggio.notes; }));

                    _.each(arpeggioNotes, function (n, i) {
                        var arpeggioNoteFrequency = NOTES[ORDERED_NOTES[currentNoteIndex + instrument.tuning + n][0]] + instrument.finetuning;

                        if (!instrument.glide) {
                            oscillator.frequency.setValueAtTime(arpeggioNoteFrequency, startTime + (arpeggioNoteTime * i));
                        }
                        else {
                            oscillator.frequency.linearRampToValueAtTime(arpeggioNoteFrequency, startTime + (arpeggioNoteTime * i));
                        }
                    });
                }
            }

            // apply volume and pitch modulations
            var ticks = timeInSeconds / MODULATIONS_STEPS;
            _.times(MODULATIONS_STEPS, function (i) {
                if (i === 0) return;

                // ignore the first volume slide as it's already set
                instrument.amp.gain.linearRampToValueAtTime(instrument.volume[i], startTime + (ticks * i) + anticlick);

                // ignore the pitch changes if arpeggio is active
                if (!instrument.arpeggio.active) {
                    var pitch           = instrument.pitch[i];
                    var pitchShift      = (-0.5 + pitch) * (instrument.oscillatorType === 'noise' ? NOISE_PITCH_SHIFT_ADJUSTMENT : PITCH_SHIFT_ADJUSTMENT);
                    var targetFrequency = (noteFrequency - initialPitchShift) + pitchShift

                    // ignore the first pitch slide as it's already set or if pitch modulation is enabled
                    if (!instrument.vibrato.active) {
                        oscillator.frequency.linearRampToValueAtTime(targetFrequency, startTime + (ticks * i) + anticlick);
                    }
                }

                // modulate the filter
                if (instrument.filter.active) {
                    instrument.filterNode.frequency.linearRampToValueAtTime(instrument.filter.baseFrequency + (instrument.filter.frequencies[i] * FILTER_MODULATION_ADJUSTMENT), startTime + (ticks * i));
                }
            });

            // stop the oscillator
            if ((instrument.glide && !forceStop) || dontStop) return;

            self.clock.callbackAtTime(function () {
                var currentTime = self.context.currentTime;

                // gradually stop the note
                instrument.amp.gain.setValueAtTime(_.last(instrument.volume), currentTime);
                instrument.amp.gain.linearRampToValueAtTime(0.0, currentTime + anticlick);

                // gradually stop the tremolo
                instrument.tremoloGain.gain.setValueAtTime(instrument.tremoloGain.gain.value, currentTime);
                instrument.tremoloGain.gain.linearRampToValueAtTime(0.0, currentTime + anticlick);

                oscillator.stop(currentTime + anticlick);
                instrument.vibratoGain.disconnect();

                instrument.playingNote = null;

                if (doneCallback !== undefined) doneCallback();
            }, stopTime - anticlick);
        },

        playPattern: function (pattern, bpm, doneCallback) {
            var self = this;
            var startTime = this.context.currentTime;

            var currentNote;
            var noteLength;

            var clonedInstruments = _.cloneDeep(this.instruments);

            _.each(pattern, function (row, i) {
                var instrument = clonedInstruments[row[PATTERN_NOTE_INSTRUMENT]];

                _.each([row[PATTERN_NOTE_EFFECT_1], row[PATTERN_NOTE_EFFECT_2], row[PATTERN_NOTE_EFFECT_3]], function (fx) {
                    switch (fx) {
                        case PATTERN_NOTE_EFFECT_GLIDE_ON:
                            instrument.glide = true;
                            break;
                        case PATTERN_NOTE_EFFECT_GLIDE_OFF:
                            instrument.glide = false;
                            break;
                        case PATTERN_NOTE_EFFECT_TREMOLO_ON:
                            instrument.tremolo.active = true;
                            break;
                        case PATTERN_NOTE_EFFECT_TREMOLO_OFF:
                            instrument.tremolo.active = false;
                            break;
                        case PATTERN_NOTE_EFFECT_VIBRATO_ON:
                            instrument.vibrato.active = true;
                            break;
                        case PATTERN_NOTE_EFFECT_VIBRATO_OFF:
                            instrument.vibrato.active = false;
                            break;
                        case PATTERN_NOTE_EFFECT_ARPEGGIO_ON:
                            instrument.arpeggio.active = true;
                            break;
                        case PATTERN_NOTE_EFFECT_ARPEGGIO_OFF:
                            instrument.arpeggio.active = false;
                            break;
                        case PATTERN_NOTE_EFFECT_FILTER_ON:
                            instrument.filter.active = true;
                            break;
                        case PATTERN_NOTE_EFFECT_FILTER_OFF:
                            instrument.filter.active = false;
                            break;
                        case PATTERN_NOTE_EFFECT_REVERB_ON:
                            instrument.effects.reverb = true;
                            break;
                        case PATTERN_NOTE_EFFECT_REVERB_OFF:
                            instrument.effects.reverb = false;
                            break;
                    }
                });

                noteLength = (1000 / (bpm / 60)) * row[PATTERN_NOTE_LENGTH];

                var nextHasGlideOn = pattern[i + 1] !== undefined &&
                        (pattern[i + 1][PATTERN_NOTE_EFFECT_1] === PATTERN_NOTE_EFFECT_GLIDE_ON
                        || pattern[i + 1][PATTERN_NOTE_EFFECT_2] === PATTERN_NOTE_EFFECT_GLIDE_ON
                        || pattern[i + 1][PATTERN_NOTE_EFFECT_3] === PATTERN_NOTE_EFFECT_GLIDE_ON);
                var nextHasGlideOff = pattern[i + 1] !== undefined &&
                        (pattern[i + 1][PATTERN_NOTE_EFFECT_1] === PATTERN_NOTE_EFFECT_GLIDE_OFF
                        || pattern[i + 1][PATTERN_NOTE_EFFECT_2] === PATTERN_NOTE_EFFECT_GLIDE_OFF
                        || pattern[i + 1][PATTERN_NOTE_EFFECT_3] === PATTERN_NOTE_EFFECT_GLIDE_OFF);
                var nextIsSameInstrument = pattern[i + 1] !== undefined && pattern[i + 1][PATTERN_NOTE_INSTRUMENT] == row[PATTERN_NOTE_INSTRUMENT];

                self.playNote({
                    note:         row[PATTERN_NOTE_NOTE],
                    instrument:   instrument,
                    time:         noteLength,
                    bpm:          bpm,
                    startTime:    startTime,
                    last:         i == pattern.length -1,
                    dontStop:     (instrument.glide && nextIsSameInstrument && !nextHasGlideOff) || (nextIsSameInstrument && nextHasGlideOn),
                    doneCallback: i == pattern.length -1 ? doneCallback : undefined

                });

                startTime += (noteLength / 1000) + self.anticlickAdjustment((noteLength / 1000));
            })
        }

    };

    RetroSound.OSC_TYPES             = OSC_TYPES;
    RetroSound.FILTER_TYPES          = FILTER_TYPES;
    RetroSound.FILTER_MAX_FREQUENCY  = FILTER_MAX_FREQUENCY;
    RetroSound.ORDERED_NOTES         = ORDERED_NOTES;
    RetroSound.NOTES                 = NOTES;
    RetroSound.MODULATIONS_STEPS     = MODULATIONS_STEPS;
    RetroSound.MODULATION_DEPTH      = MODULATION_DEPTH;
    RetroSound.TREMOLO_MAX_FREQUENCY = TREMOLO_MAX_FREQUENCY;
    RetroSound.VIBRATO_MAX_FREQUENCY = VIBRATO_MAX_FREQUENCY;

    this.RetroSound = RetroSound;
})(this);
