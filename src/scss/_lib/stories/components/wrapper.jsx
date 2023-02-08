export const Wrapper = ({ children, title, note }) => {
  return (
    <div className='m-0 p-20 bg-gray-100 mb-20'>
      {title &&
        <h3 class="fz-18 m-0 mb-10">{title}</h3>
      }
      {note &&
        <p class="fz-14 m-0 mb-10">Note : {note}</p>
      }
      {children}
    </div>
  )
}

export default Wrapper;
