import { useState } from 'react';

import { 
  Button, 
  AnglePickerControl,
  Flex, FlexItem,
  Panel, PanelBody, PanelRow,
  __experimentalAlignmentMatrixControl as AlignmentMatrixControl,
  __experimentalBoxControl as BoxControl,
  __experimentalGrid as Grid,
  __experimentalSpacer as Spacer,
  __experimentalVStack as VStack
} from '@wordpress/components';

export default () => {

  const [ angle, setAngle ] = useState( 0 );

  return (
      <Grid className="GraphicComposition__wrapper" templateColumns="1fr 250px">
          <div className="GraphicComposition__canvas">
            <h1>Hello World</h1>
          </div>

          <VStack expanded={true} spacing="0px">
            <Spacer>
              <Panel header="Toolbar" className="GraphicComposition__toolbar">
                <PanelBody title="Assets" initialOpen={false}>
                  <PanelRow>My Panel Inputs and Labels</PanelRow>
                  <PanelRow>My Panel Inputs and Labels</PanelRow>
                </PanelBody>

                <PanelBody title="Properties" initialOpen={true}>
                  <AlignmentMatrixControl label="Alignment" />
                  <BoxControl label="Position" />
                  <AnglePickerControl value={ angle } onChange={ setAngle } />
                </PanelBody>

                <PanelBody title="Layers" initialOpen={true}>
                </PanelBody>
              </Panel>
            </Spacer>

            <Flex>
              <FlexItem>
                <Button isDestructive={true}>Cancel</Button>
              </FlexItem>
              <FlexItem>
                <Button variant="primary">Done</Button>
              </FlexItem>
            </Flex>
          </VStack>
      </Grid>
  )
}
