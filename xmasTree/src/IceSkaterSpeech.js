import { NeverCompare } from "three"

// IceSkaterSpeech.js
export const skaterDialogSequence = [
    "Hey there! I'm Christmas, an AI learning to ice skate in the metaverse!",
    "The Dev got high and watch videos of AI bots learning to walk.",
    "Now I'm here learning to skate, anyways not really part of the coin",
    "I'm just here to have fun and spread some holiday cheer!"
  ]
  
  export class IceSkaterSpeech {
    constructor() {
      this.audio = new Audio('/ice-skater-speech.mp3')
      this.isPlaying = false
      this.currentDialogIndex = 0
      this.onDialogChange = null
      
      // Pre-load the audio
      this.audio.load()
      
      this.audio.onended = () => {
        console.log('Speech ended')
        this.isPlaying = false
        this.currentDialogIndex = (this.currentDialogIndex + 1) % skaterDialogSequence.length
        if (this.onDialogChange) {
          this.onDialogChange()
        }
      }

      this.audio.onerror = (error) => {
        console.error('Audio loading error:', error)
        this.isPlaying = false
        if (this.onDialogChange) {
          this.onDialogChange()
        }
      }
    }
  
    async play() {
      if (!this.isPlaying) {
        this.isPlaying = true
        console.log('Starting speech playback...')
        try {
          await this.audio.play()
          console.log('Speech playing successfully')
        } catch (error) {
          console.error('Speech playback failed:', error)
          this.isPlaying = false
          throw error
        }
      }
    }
  
    stop() {
      if (this.isPlaying) {
        this.audio.pause()
        this.audio.currentTime = 0
        this.isPlaying = false
      }
    }
  
    getCurrentDialog() {
      return skaterDialogSequence[this.currentDialogIndex]
    }
  }