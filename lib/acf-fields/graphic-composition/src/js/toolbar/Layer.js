import { Icon, trash } from '@wordpress/icons';

export default ({ title, onClick, onDelete }) => {
  const aria = `Delete this layer "${ title }" ?`;
  
  return (
    <div className="GraphicComposition__Layer">
      <button className="GraphicComposition__Layer__label" onClick={ onClick }>{ title }</button>
      <button className="GraphicComposition__Layer__delete" onClick={ onDelete } aria-label={ aria }>
        <div className="GraphicComposition__Layer__icon" aria-hidden="true">
          <Icon icon={trash} />
        </div>
      </button>
    </div>
  )
};
