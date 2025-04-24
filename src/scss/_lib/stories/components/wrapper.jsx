import React from 'react';

export const Wrapper = ({ children, title, note, className }) => {
  const classNames = [`wrapper m-0 p-20 bg-gray-100 mb-20`];
  if(className) classNames.push(className)

  return (
    <section className={classNames.join(" ")}>
      {title &&
        <h3 className="fz-18 m-0 mb-10">{title}</h3>
      }
      {note &&
        <p className="fz-14 m-0 mb-10">Note : {note}</p>
      }
      {children}
    </section>
  )
}

export default Wrapper;
