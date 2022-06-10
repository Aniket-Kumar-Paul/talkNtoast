import React from 'react'

const StepName = ({onNext}) => {
  return (
    <div>
      <div>StepName</div>
      <button onClick={onNext}>Next</button>
    </div>
  )
}

export default StepName