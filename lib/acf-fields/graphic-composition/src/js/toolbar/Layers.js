import { useDispatch } from 'react-redux';
import { PanelBody } from '@wordpress/components';
import { Icon, create } from '@wordpress/icons';

import { addLayer } from "../redux/document";
import Layer from "./Layer";

export default ({ layers }) => {
  const dispatch = useDispatch();

  const tree = layers.map(layer => <Layer key={ layer.id } title={ layer.title } />);

  return (
    <PanelBody title="Layers" initialOpen={true} className="GraphicComposition__layers">

      <button 
        className="GraphicComposition__layers__plusBtn" 
        aria-label="Add layer" 
        onClick={() => dispatch( addLayer() )}
      >
        <Icon icon={create} size="26" />
      </button>

      { tree }
    </PanelBody>
  )
}
