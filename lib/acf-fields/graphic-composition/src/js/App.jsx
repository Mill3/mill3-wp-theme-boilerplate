import { Button } from '@wordpress/components';

export default function App() {
    return (
        <div className="GraphicComposition__wrapper">
            <div className="GraphicComposition__canvas">
              <h1>Hello World</h1>
            </div>

            <aside className="GraphicComposition__toolbar">
                <div className="GraphicComposition__assets">
                    <h2>Assets</h2>
                </div>

                <div className="GraphicComposition__properties">
                    <h2>Properties</h2>
                </div>

                <div className="GraphicComposition__layers">
                    <h2>Layers</h2>
                </div>

                <div className="GraphicComposition__actions">
                    <Button isDestructive={true}>Cancel</Button>
                    <Button variant="primary">Done</Button>
                </div>

            </aside>
        </div>
     );
}
