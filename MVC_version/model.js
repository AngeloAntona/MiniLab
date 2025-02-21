// model.js
class Model {
    constructor(audioModel) {
        this.audioModel = audioModel;

        //Preset parameters
        this.knobsLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.cntrlPedalLinks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.activateBass = false;
        this.activateKey = false;
        this.bassOscillator = " ";
        this.keyOscillator = " ";
        this.arpOscillator = " ";
        this.currentFollow = 'key';
        this.bassOctave = 1;
        this.keyOctave = 1;
        this.arpOctave = 1;
        this.bassSustain = false;
        this.keySustain = false;
        this.arpSustain = false;
        this.bassMono = false;
        this.keyMono = false;
        this.bassWheel = false;
        this.keyWheel = false;
        this.currentOptionKeyIndex = 0;
        this.currentOptionBassIndex = 0;
        this.currentOptionArpIndex = 0;
        this.split = false;
        this.splitArp = false;


        this.waveformOptions = ['sine', 'square', 'sawtooth', 'triangle'];
        this.presets=[];
        this.presMapKnob1=0;
        this.presMapKnob2=1;
        this.isSustainPedalDown = false;
        this.pressedBass = {};
        this.sustainedBass = {};
        this.pressedKeys = {};
        this.sustainedNotes = {};
        this.arpeggiatorIndexes = [];
        this.sustainedArp = [];
        this.arpeggiatorNotes = {};
        this.pads = [0, 0, 0, 0, 0, 0, 0, 0];
        this.activeArp = false;
        this.arpInterval = null;
        this.currentArpNote = 0;
        this.arpDecay = 80;
        this.keyWheel = false;
        this.arpWheel = false;
        this.bassWheel = false;
        this.currentWheel = 0;  
        this.refreshAudioParameters();
    }

    setPresets(presets){
        this.presets=presets;
        this.setPreset(this.presets[0]);
    }

    setPreset(preset) {
        // Apply the preset to the model
        this.knobsLevel = Array.from(preset.knobsLevel) || this.knobsLevel;
        this.cntrlPedalLinks = preset.cntrlPedalLinks;
        this.activateBass = preset.activateBass;
        this.activateKey = preset.activateKey;
        this.currentOptionBassIndex = preset.currentOptionBassIndex;
        this.currentOptionKeyIndex = preset.currentOptionKeyIndex;
        this.currentOptionArpIndex = preset.currentOptionArpIndex;
        this.bassOctave = preset.bassOctave;
        this.keyOctave = preset.keyOctave;
        this.bassSustain = preset.bassSustain;
        this.keySustain = preset.keySustain;
        this.bassMono = preset.bassMono;
        this.keyMono = preset.keyMono;
        this.bassWheel = preset.bassWeel;
        this.keyWheel = preset.keyWheel;
        this.split = preset.split;
        this.activeArp = preset.activeArp;
        this.arpOctave = preset.arpOctave;
        this.arpSustain = preset.arpSustain;
        this.splitArp = preset.splitArp;
        this.keyWheel = preset.keyWheel;
        this.arpWheel = preset.arpWheel;
        this.bassWheel = preset.bassWeel;
        this.refreshAudioParameters();
        this.setWaveform();
    }

    setPresMapKnob(presMapKnob1, presMapKnob2){
        this.presMapKnob1=presMapKnob1;
        this.presMapKnob2=presMapKnob2;
    }

    getPresetNames(){
        const names = [];
        this.presets.forEach(preset => {
            names.push(preset.name);
        });
        return names;
    }

    getOctave(inst) {
        if (inst == 'key') { return Math.log2(this.keyOctave); }
        else if (inst == 'bass') { return Math.log2(this.bassOctave); }
        else if (inst == 'arp') { return Math.log2(this.arpOctave); }
    }

    getKeyShift(note) {
        const oct = Math.log2(this.keyOctave);
        return note + (Math.round(oct) * 12);
    }

    getBassShift(note) {
        const oct = Math.log2(this.bassOctave);
        return note + (Math.round(oct) * 12);
    }

    getArpShift(note) {
        const arpOct = Math.log2(this.arpOctave);
        return (Number(note) + Number(Math.round(arpOct) * 12));
    }

    exportCurrentPreset(name) {
        const preset = {
            name: name,
            knobsLevel: this.knobsLevel,
            cntrlPedalLinks: this.cntrlPedalLinks,
            activateBass: this.activateBass,
            activateKey: this.activateKey,
            currentOptionKeyIndex: this.currentOptionKeyIndex,
            currentOptionBassIndex: this.currentOptionBassIndex,
            currentOptionArpIndex: this.currentOptionArpIndex,
            bassOctave: this.bassOctave,
            keyOctave: this.keyOctave,
            bassSustain: this.bassSustain,
            keySustain: this.keySustain,
            bassMono: this.bassMono,
            keyMono: this.keyMono,
            bassWeel: this.bassWheel,
            keyWheel: this.keyWheel,
            split: this.split,
            activeArp: this.activeArp,
            arpOctave: this.arpOctave,
            arpSustain: this.arpSustain,
            splitArp: this.splitArp,
            keyWheel: this.keyWheel,
            arpWheel: this.arpWheel,
            bassWheel: this.bassWheel,
        };

        return preset;
    }

    flipSplitArp() {
        this.splitArp = !this.splitArp;
    }

    flipSplit() {
        this.split = !this.split;
    }

    flipMono(inst) {
        if (inst === 'key') {
            this.keyMono = !this.keyMono;
        }
        else if (inst === 'bass') {
            this.bassMono = !this.bassMono;
        }
    }
    
    flipSust(inst) {
        if (inst === 'key') {
            this.keySustain = !this.keySustain;
        }
        else if (inst === 'bass') {
            this.bassSustain = !this.bassSustain;
        }
        else if (inst === 'arp') {
            this.arpSustain = !this.arpSustain;
        }
    }

    flipWheel(inst) {
        if (inst === 'key') { this.keyWheel = !this.keyWheel; }
        else if (inst === 'bass') { this.bassWheel = !this.bassWheel; }
        else if (inst === 'arp') { this.arpWheel = !this.arpWheel; }
    }

    updateKnobLevel(idx, value) {
        this.knobsLevel[idx] = value;
    }

    setWaveform() {
        this.keyOscillator = this.waveformOptions[this.currentOptionKeyIndex];
        this.bassOscillator = this.waveformOptions[this.currentOptionBassIndex];
        this.arpOscillator = this.waveformOptions[this.currentOptionArpIndex];
    }

    shiftOctave(inst, direction) {
        if (inst === 'key') {
            if (direction === '+' && this.keyOctave <= 8) { this.keyOctave = this.keyOctave * 2 }
            else if (direction === '-' && this.keyOctave >= 1 / 8) { this.keyOctave = this.keyOctave / 2 }
        }
        if (inst === 'bass') {
            if (direction === '+' && this.bassOctave <= 8) { this.bassOctave = this.bassOctave * 2 }
            else if (direction === '-' && this.bassOctave >= 1 / 8) { this.bassOctave = this.bassOctave / 2 }
        }
        if (inst === 'arp') {
            if (direction === '+' && this.arpOctave <= 8) { this.arpOctave = this.arpOctave * 2 }
            else if (direction === '-' && this.arpOctave >= 1 / 8) { this.arpOctave = this.arpOctave / 2 }
        }
    }

    activateInstrument(instrument, status) {
        if (instrument === 'bass') {
            if (status === 'active') {
                this.activateBass = true;
            }
            else {
                this.activateBass = false;
            }
        }
        else if (instrument === 'key') {
            if (status === 'active') {
                this.activateKey = true;
            }
            else {
                this.activateKey = false;
            }
        }
        else if (instrument === 'arp') {
            this.activeArp = !this.activeArp;
            if (!this.activeArp) {
                this.sustainedArp.length = 0;
                this.arpeggiatorIndexes.length = 0;
            }
        }
    }

    handleWheel(value) {
        if (this.arpWheel) { this.audioModel.frequencyValues[2] = Math.pow(2, 2 * (value - 64) / (64 * 12)); }
        else { this.audioModel.frequencyValues[2] = 1; }
        if (this.keyWheel) { this.audioModel.frequencyValues[0] = Math.pow(2, 2 * (value - 64) / (64 * 12)); }
        else { this.audioModel.frequencyValues[0] = 1; }
        if (this.bassWheel) { this.audioModel.frequencyValues[1] = Math.pow(2, 2 * (value - 64) / (64 * 12)); }
        else { this.audioModel.frequencyValues[1] = 1; }
    }

    handleSustain(note) {
        if (note && this.isSustainPedalDown) {
            this.sustainedNotes[note] = this.pressedKeys[note];
            delete this.pressedKeys[note];
        } else {
            this.deleteAllSustainedNotes('key');
        }
    }

    handleNoteOn(note) {
        const currentNote = this.getKeyShift(note);
        if (!this.pressedKeys[currentNote]) {
            this.pressedKeys[currentNote] = this.audioModel.playNote(currentNote, this.keyOscillator, 'key');
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    handleNoteOff(note) {
        const currentNote = this.getKeyShift(note);
        if (this.pressedKeys[currentNote]) {
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            if (this.isSustainPedalDown && !this.sustainedNotes[currentNote] && this.keySustain) {
                this.handleSustain(currentNote);
            } else {
                this.audioModel.stopNote(this.pressedKeys[currentNote]);
                delete this.pressedKeys[currentNote];
            }
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    deleteAllNotes(inst) {
        if (inst == 'key') {
            const keysToDelete = Object.keys(this.pressedKeys);
            keysToDelete.forEach(note => {
                this.audioModel.stopNote(this.pressedKeys[note]);
                delete this.pressedKeys[note];
            });
        }
        else if (inst == 'bass') {
            const bassToDelete = Object.keys(this.pressedBass);
            bassToDelete.forEach(bass => {
                this.audioModel.stopNote(this.pressedBass[bass]);
                delete this.pressedBass[bass];
            });
        }
        else if (inst == 'arp') {
            const arpToDelete = Object.keys(this.arpeggiatorNotes);
            arpToDelete.forEach(note => {
                this.audioModel.stopNote(this.arpeggiatorNotes[note]);
                delete this.arpeggiatorNotes[note];
            });
        }
    }

    deleteAllSustainedNotes(inst) {
        if (inst == 'key') {
            const keysToDelete = Object.keys(this.sustainedNotes);
            keysToDelete.forEach(note => {
                this.audioModel.stopNote(this.sustainedNotes[note]);
                delete this.sustainedNotes[note];
            });
        }
        else if (inst == 'bass') {
            const bassToDelete = Object.keys(this.sustainedBass);
            bassToDelete.forEach(bass => {
                this.audioModel.stopNote(this.sustainedBass[bass]);
                delete this.sustainedBass[bass];
            });
        }
        else if (inst === 'arp') { this.sustainedArp.length = 0; }
    }

    handleBassSustain(note) {
        if (note && this.isSustainPedalDown) {
            this.sustainedBass[note] = this.pressedBass[note];
            delete this.pressedBass[note];
        } else {
            this.deleteAllSustainedNotes('bass');
        }
    }

    handleBassOn(note) {
        const currentNote = this.getBassShift(note);
        if (!this.pressedBass[currentNote]) {
            this.pressedBass[currentNote] = this.audioModel.playNote(currentNote, this.bassOscillator, 'bass');
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    handleBassOff(note) {
        const currentNote = this.getBassShift(note);
        if (this.pressedBass[currentNote]) {
            const ledSelector = '#key' + String(Math.abs(note) % 24 + 1);
            const keySelector = '#key' + String(Math.abs(note) % 24 + 1);
            if (this.isSustainPedalDown && !this.sustainedBass[currentNote] && this.bassSustain) {
                this.handleBassSustain(currentNote);
            } else {
                this.audioModel.stopNote(this.pressedBass[currentNote]);
                delete this.pressedBass[currentNote];
            }
            return { display, ledSelector, keySelector };
        }
        return null;
    }

    handleArpNoteOn(note) {
        const currentNote = this.getArpShift(note);
        this.arpeggiatorNotes[currentNote] = this.audioModel.playNote(currentNote, this.arpOscillator, 'arp');
        this.currentArpNote = currentNote;
        setTimeout(() => {
            this.audioModel.stopNote(this.arpeggiatorNotes[currentNote]);
            delete this.arpeggiatorNotes[currentNote];
            this.currentArpNote = 0;
        }, this.arpDecay);
    }

    handleArpSustain(note) {
        if (note && this.isSustainPedalDown) {
            const indexOfElement = this.arpeggiatorIndexes.indexOf(note);
            if (indexOfElement !== -1) {
                this.arpeggiatorIndexes.splice(indexOfElement, 1);
                const insertIndex = this.sustainedArp.findIndex((element) => element > note);
                if (insertIndex !== -1) { this.sustainedArp.splice(insertIndex, 0, note); }
                else { this.sustainedArp.push(note); }
                this.sustainedArp = [...new Set(this.sustainedArp)].sort((a, b) => a - b);
            }
        } else { this.deleteAllSustainedNotes('arp'); }
    }

    handleArpeggioOff(note) {
        const currentNote = this.getKeyShift(note);
        if (this.arpeggiatorIndexes.includes(currentNote)) {
            if (this.isSustainPedalDown && this.arpSustain) {
                this.handleArpSustain(currentNote);
            } else {
                const indexToDelete = this.arpeggiatorIndexes.indexOf(currentNote);
                this.arpeggiatorIndexes.splice(indexToDelete, 1);
            }
        }
    }

    playArpSequence(currentIndex) {
        let indexArray = [];
        indexArray = [...this.arpeggiatorIndexes, ...this.sustainedArp];
        indexArray = [...new Set(indexArray)].sort((a, b) => a - b);
        if (indexArray[currentIndex] != undefined) { this.handleArpNoteOn(indexArray[currentIndex]); }
        currentIndex = (currentIndex + 1) % Math.max(1, indexArray.length);
        if (!this.activeArp) {
            clearInterval(this.arpInterval);
            this.arpInterval = null;
        }
        this.arpInterval = setTimeout(() => { this.playArpSequence(currentIndex) }, Math.max(1, Math.max(this.arpDecay, 3 * this.knobsLevel[16] * 120)));
    }

    handleArpeggioOn(note) {
        if (!this.arpeggiatorIndexes.includes(note)) {
            const indexToInsert = this.arpeggiatorIndexes.findIndex(existingNote => existingNote > note);
            // If indexToInsert is -1, the new note is the largest so far, push it to the end
            if (indexToInsert === -1) {
                this.arpeggiatorIndexes.push(note);
            } else {
                // Insert the new note at the correct position
                this.arpeggiatorIndexes.splice(indexToInsert, 0, note);
            }
        }
        if (this.activeArp && (this.arpInterval === null)) { this.playArpSequence(0); }
        else if ((!this.activeArp) && this.arpInterval != null) {
            clearInterval(this.arpInterval);
            this.arpInterval = null;
        }
    }

    handlePadOn(note) {
        if (this.pads[note] === 0) {
            if (note === 0) {
                this.audioModel.playKick();
            } else if (note === 1) {
                this.audioModel.playSnare();
            } else if (note === 2) {
                this.audioModel.playClosedHiHat();
            } else if (note === 3) {
                this.audioModel.playCrashCymbal();
            } else if (note === 4) { }
            else if (note === 5) { }
            else if (note === 6) { }
            else if (note === 7) { }
            this.pads[note] = 1;
            return true;
        }
        return false;
    }

    handlePadOff(note) {
        if (this.pads[note] === 1) {
            let padIndex = null;
            if (note === 0 || note === 1 || note === 2 || note === 3) {
                padIndex = note;
            }
            this.pads[note] = 0;
            return { display, padIndex };
        }
        return null;
    }

    handleControlChangeEvent(device, controllerNumber, value) {
        if ((device === 'midiKey' || device === 'touch') && (this.cntrlPedalLinks[controllerNumber - 19] === 0)) {
            const id = controllerNumber - 19;
            this.knobsLevel[id] = value / 127;
            const knob = document.getElementById('knob' + id);
            this.refreshAudioParameters();
            return { knob };
        }
        else if (device === 'cntrlPedal') {
            const id = controllerNumber;
            const divisor = 127;
            for (let i = 0; i < this.knobsLevel.length; i++) {
                console.log();
                if (this.cntrlPedalLinks[i] === 1) { this.knobsLevel[i] = Math.min(1, Math.max(0, Math.pow(2, Math.max(0, value / divisor)) - 1)); }
                else if (this.cntrlPedalLinks[i] === -1) { this.knobsLevel[i] = Math.min(1, 1 - Math.log2(Math.max(1, 1 + (value / divisor)))); }
            }
            const knob = document.getElementById('knob' + id);
            this.refreshAudioParameters();
            return { knob };
        }
    }

    connectPedalKnobs(knobNumber, mode) {
        this.cntrlPedalLinks[knobNumber] = mode;
    }

    handleMidiPresetChange(idx){
        if(idx===1){this.setPreset(this.presets[this.presMapKnob1]);}
        else if (idx===2){this.setPreset(this.presets[this.presMapKnob2]);}
    }

    refreshAudioParameters() {
        this.audioModel.setMainGain(this.knobsLevel[0]);
        this.audioModel.setInstGain(this.knobsLevel[1]);
        this.audioModel.setLowPassFilterFrequency(this.knobsLevel[2] * 14990 + 100, 'key');
        this.audioModel.setHiPassFilterFrequency(this.knobsLevel[3] * 14990 + 100, 'key');
        this.audioModel.setDelayTime(this.knobsLevel[4], 'key');
        this.audioModel.setDelayFeedback(this.knobsLevel[5], 'key');
        this.audioModel.setKeyGain(this.knobsLevel[7]);
        this.audioModel.setArpGain(this.knobsLevel[8]);
        this.audioModel.setDrumGain(this.knobsLevel[9]);
        this.audioModel.setLowPassFilterFrequency(this.knobsLevel[10] * 14990 + 100, 'bass');
        this.audioModel.setHiPassFilterFrequency(this.knobsLevel[11] * 14990 + 100, 'bass');
        this.audioModel.setDelayTime(this.knobsLevel[12], 'bass');
        this.audioModel.setDelayFeedback(this.knobsLevel[13], 'bass');
        this.audioModel.setBassGain(this.knobsLevel[15]);
    }
}