import { useEffect } from 'react';

import { 
  Button, 
  AnglePickerControl,
  Panel, PanelBody, PanelRow,
  __experimentalAlignmentMatrixControl as AlignmentMatrixControl,
  __experimentalBoxControl as BoxControl,
} from '@wordpress/components';

import Layers from "./toolbar/Layers";

export default ({ layers, settings, onDone, onCancel }) => {
  const done = () => {
    const layers = [];
    onDone(layers);
  };

  //useEffect(() => {
  //  console.log('store has changed', store);
  //}, [store]);

  return (
    <div className="GraphicComposition__wrapper">
      <div className="GraphicComposition__canvas">
        <h1>Width: { settings.width }px / Height: { settings.height }px</h1>
      </div>

      <Panel className="GraphicComposition__toolbar">
        <PanelBody title="Assets" initialOpen={false} className='GraphicComposition__assets'>
          <PanelRow>My Panel Inputs and Labels</PanelRow>
        </PanelBody>

        <PanelBody title="Properties" initialOpen={true} className='GraphicComposition__properties'>
          <AlignmentMatrixControl label="Alignment" />
          <BoxControl label="Position" units="%" />
          <AnglePickerControl />
        </PanelBody>

        <Layers layers={ layers } />
      </Panel>

      <div className="GraphicComposition__actions">
        <Button isDestructive={true} onClick={ onCancel }>Cancel</Button>
        <Button variant="primary" onClick={ done }>Done</Button>
      </div>
    </div>
  )
}
