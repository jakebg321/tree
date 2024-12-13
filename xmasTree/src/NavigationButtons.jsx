import React from 'react'

export const NavigationButtons = () => {
  const buttonStyle = {
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid white',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    margin: '0 5px'
  }

  const containerStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    gap: '10px',
    zIndex: 1000
  }

  return (
    <div style={containerStyle}>
      <button
        style={buttonStyle}
        onClick={() => window.moveToView('default')}
        onMouseEnter={e => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
        onMouseLeave={e => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
      >
        Home
      </button>
      <button
        style={buttonStyle}
        onClick={() => window.handleBack?.()}
        onMouseEnter={e => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
        onMouseLeave={e => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
      >
        Back
      </button>
    </div>
  )
}