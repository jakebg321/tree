// src/utils/transactionSimulator.js
class TransactionSimulator {
    constructor(options = {}) {
      this.minAmount = options.minAmount || 100
      this.maxAmount = options.maxAmount || 10000
      this.minInterval = options.minInterval || 1000  // 1 second
      this.maxInterval = options.maxInterval || 5000  // 5 seconds
      this.listeners = new Set()
      this.isRunning = false
      this.timeout = null
    }
  
    // Generate a random transaction
    generateTransaction() {
      // 75% chance for small transaction
      const isSmallTransaction = Math.random() < 0.75;
      
      const amount = isSmallTransaction
        ? Math.random() * 100 + 100  // Random amount between 100-200
        : Math.random() * (this.maxAmount - 200) + 200  // Random amount between 200-maxAmount

      const transactionType = Math.random() > 0.5 ? 'buy' : 'sell'
      
      return {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        timestamp: Date.now(),
        type: transactionType,
        // Size category for visual representation
        sizeCategory: amount > 5000 ? 'large' : amount > 1000 ? 'medium' : 'small'
      }
    }
  
    // Add a listener for new transactions
    addListener(callback) {
      this.listeners.add(callback)
      return () => this.listeners.delete(callback)
    }
  
    // Notify all listeners of a new transaction
    notifyListeners(transaction) {
      this.listeners.forEach(listener => listener(transaction))
    }
  
    // Schedule the next transaction
    scheduleNext() {
      if (!this.isRunning) return
      
      const delay = Math.random() * (this.maxInterval - this.minInterval) + this.minInterval
      this.timeout = setTimeout(() => {
        const transaction = this.generateTransaction()
        this.notifyListeners(transaction)
        this.scheduleNext()
      }, delay)
    }
  
    // Start generating transactions
    start() {
      if (this.isRunning) return
      this.isRunning = true
      this.scheduleNext()
    }
  
    // Stop generating transactions
    stop() {
      this.isRunning = false
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
    }
  
    // Generate a burst of transactions (useful for testing)
    generateBurst(count = 5, interval = 200) {
      let processed = 0
      
      const burstInterval = setInterval(() => {
        const transaction = this.generateTransaction()
        this.notifyListeners(transaction)
        processed++
        
        if (processed >= count) {
          clearInterval(burstInterval)
        }
      }, interval)
    }
  }
  
  // Usage example:
  const defaultSimulatorOptions = {
    minAmount: 100,    // Minimum transaction amount
    maxAmount: 10000,  // Maximum transaction amount
    minInterval: 500, // Minimum time between transactions (ms)
    maxInterval: 2000  // Maximum time between transactions (ms)
  }
  
  export const createTransactionSimulator = (options = {}) => {
    return new TransactionSimulator({ ...defaultSimulatorOptions, ...options })
  }
  
  // Helper function to format transaction amounts
  export const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }