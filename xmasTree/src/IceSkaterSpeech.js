// IceSkaterSpeech.js
export const skaterDialogSequence = [
    "Hey there! I'm Christmas, an AI learning to ice skate in the metaverse!",
    "Just like neural networks, I'm all about finding patterns in movement.",
    "Each spin and jump is like processing a new data point.",
    "Want to see how an AI dances on ice?"
  ]
  
  export class IceSkaterSpeech {
    constructor() {
      this.audio = new Audio()
      this.audio.src = '/ice-skater-speech.mp3'
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
      if (this.isPlaying) return

      try {
        this.isPlaying = true
        console.log('Starting audio playback...')
        await this.audio.play()
        console.log('Audio playing successfully')
      } catch (error) {
        this.isPlaying = false
        console.error('Audio playback failed:', error)
        throw error
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