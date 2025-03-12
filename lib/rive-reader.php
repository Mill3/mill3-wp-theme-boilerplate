<?php

namespace Mill3WP\rive;


class RiveBinaryReader {
    private $data;
    private $length = 0;
    private $offset = 0;
    private $error = false;

    public function __construct($binaryData) {
        $this->data = $binaryData;
        $this->length = strlen($this->data);
    }

    public function readByte() {
        if ($this->offset >= $this->length) return false;

        return ord($this->data[$this->offset++]);
    }

    public function readImage() {
        return $this->readString();
    }

    public function readVarUint() {
        $value = 0;
        $shift = 0;
        while (true) {
            $byte = $this->readByte();
            if ($byte === false) {
                return false;
            }
            $value |= ($byte & 0x7F) << $shift;
            if (($byte & 0x80) == 0) {
                break;
            }
            $shift += 7;
        }
        return $value;
    }

    public function readUint32() {
        if ($this->offset + 4 > $this->length) {
            return false;
        }

        $value = unpack("V", substr($this->data, $this->offset, 4))[1]; // 32 bit uint, little endian byte order
        $this->offset += 4;
        return $value;
    }

    public function readFloat32(): float {
        if ($this->offset + 4 > $this->length) {
            return false;
        }
        $value = unpack("g", substr($this->data, $this->offset, 4))[1]; // 32 bit floating point number encoded in 4 byte IEEE 754
        $this->offset += 4;
        return $value;
    }

    public function readString(): string {
        $length = $this->readVarUint();
        $string = "";

        for( $i = 0; $i < $length; $i++ ) {
            $string .= chr($this->readByte());
        }

        return $string;
    }

    public function readColor(): array {
        $r = $this->readByte();
        $g = $this->readByte();
        $b = $this->readByte();
        $a = $this->readByte();

        return [$r, $g, $b, $a];
    }

    public function readListId() {
        while( !$this->didOverflow() ) {
            $propertyKey = $this->readVarUint();
            if( $propertyKey == 0 ) break;
        }

        return null;
    }

    public function didOverflow() {
        return $this->offset >= $this->length;
    }

    public function hasError() {
        return $this->didOverflow() || $this->error;
    }
}
class RiveRuntimeHeader {
    public $majorVersion;
    public $minorVersion;
    public $fileId;
    public $propertyToFieldIndex = [];

    public static function read($reader) {
        // Verify "RIVE" fingerprint
        $expectedFingerprint = "RIVE";
        for ($i = 0; $i < 4; $i++) {
            if ($reader->readByte() !== ord($expectedFingerprint[$i])) {
                return ["error" => "Invalid file format"];
            }
        }

        // Read major and minor versions
        $header = new self();
        $header->majorVersion = $reader->readVarUint();
        if ($reader->didOverflow()) return ["error" => "Overflow while reading major version"];

        $header->minorVersion = $reader->readVarUint();
        if ($reader->didOverflow()) return ["error" => "Overflow while reading minor version"];

        // Read file ID
        $header->fileId = $reader->readVarUint();
        if ($reader->didOverflow()) return ["error" => "Overflow while reading file ID"];

        // Read property keys
        $propertyKeys = [];
        while (($propertyKey = $reader->readVarUint()) !== 0) {
            $propertyKeys[] = $propertyKey;
            if ($reader->didOverflow()) return ["error" => "Overflow while reading property keys"];
        }

        // Read property-to-field index mapping
        $currentInt = 0;
        $currentBit = 8;
        foreach ($propertyKeys as $propertyKey) {
            if ($currentBit == 8) {
                $currentInt = $reader->readUint32();
                $currentBit = 0;
            }
            $fieldIndex = ($currentInt >> $currentBit) & 3;
            $header->propertyToFieldIndex[$propertyKey] = $fieldIndex;
            $currentBit += 2;

            if ($reader->didOverflow()) return ["error" => "Overflow while reading property-to-field index"];
        }

        return $header;
    }

    public function getPropertyFieldId($propertyKey) {
        if( !array_key_exists($propertyKey, $this->propertyToFieldIndex) ) return -1;

        return $this->propertyToFieldIndex[$propertyKey][1];
    }
}
class RiveFile {
    public $artboard = null;

    public static function read($reader, $header) {
        $file = new self();

        while( !$reader->didOverflow() ) {
            $object = $file->readRuntimeObject($reader, $header);
            if( $object == null ) continue;
            
            switch( $object->coreType() ) {
                case RiveArtboard::$id:
                    $file->artboard = $object;
                    break 2;
            }
        }
        
        return $file;
    }
    public function readRuntimeObject($reader, $header) {
        $coreObjectKey = $reader->readVarUint();
        $object = RiveCoreRegistry::makeCoreInstance($coreObjectKey);

        //echo '<br/><b>coreObjectKey</b>: ' . $coreObjectKey . '<br>';

        // if object key doesn't exist in registry, loop until you reach a terminator
        if( !$object ) {
            while( !$reader->didOverflow() ) {
                $propertyKey = $reader->readVarUint();

                // Terminator. https://media.giphy.com/media/7TtvTUMm9mp20/giphy.gif
                if( $propertyKey == 0 || $reader->hasError() ) return null;
            }
        }

        // loop through artboard properties
        while( !$reader->didOverflow() ) {
            $propertyKey = $reader->readVarUint();
            //echo "property: " . $propertyKey;

            // Terminator. https://media.giphy.com/media/7TtvTUMm9mp20/giphy.gif
            if( $propertyKey == 0 || $reader->hasError() ) break;

            $object->deserialize($propertyKey, $reader);
        }

        return $object;
        
    }
}


class RiveCoreRegistry {
    public static function makeCoreInstance($typeKey) {
        switch( $typeKey ) {
            case RiveArtboard::$id: return new RiveArtboard();
            case RiveImageAsset::$id: return new RiveImageAsset();
            case RiveFileAssetContents::$id: return new RiveFileAssetContents();
        }
        
        return null;
    }
}

class RiveComponent {
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 4:         // name
                $reader->readString();
                return true;

            case 5:         // parentId
            case 130:       // flags
                $reader->readVarUint();
                return true;

            case 3:         // dependentIds
            case 382:       // tagIds
                $reader->readListId();
                return true;
            
            case 6:         // childOrder
                $reader->readFloat32();
                return true;
        }

        return false;
    }
}
class RiveContainerComponent extends RiveComponent {}
class RiveWorldTransformComponent extends RiveContainerComponent {
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 18:        // opacity
                $reader->readFloat32();
                return true;
        }

        return parent::deserialize($propertyKey, $reader);
    }
}
class RiveTransformComponent extends RiveWorldTransformComponent {
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 15:        // rotation
            case 16:        // scaleX
            case 17:        // scaleY
                $reader->readFloat32();
                return true;
        }

        return parent::deserialize($propertyKey, $reader);
    }
}
class RiveNode extends RiveTransformComponent {
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 13:        // x
            case 14:        // y
                $reader->readFloat32();
                return true;

            case 176:       // styleValue
                $reader->readVarUint();
                return true;
        }

        return parent::deserialize($propertyKey, $reader);
    }
}
class RiveDrawable extends RiveNode {
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {            
            case 23:        // blendModeValue
            case 129:       // drawableFlags
                $reader->readVarUint();
                return true;
        }

        return parent::deserialize($propertyKey, $reader);
    }
}
class RiveLayoutComponent extends RiveDrawable {
    public float $width = 0;
    public float $height = 0;

    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 7:         // width
                $this->width = $reader->readFloat32();
                return true;
            case 8:         // height
                $this->height = $reader->readFloat32();
                return true;
            
            case 196:       // clip
            case 494:       // styleId
                $reader->readVarUint();
                return true;

            case 706:       // fractionalWidth
            case 707:       // fractionalHeight
                $reader->readFloat32();
                return true;
        }

        return parent::deserialize($propertyKey, $reader);
    }
}
class RiveArtboard extends RiveLayoutComponent {
    public static $id = 1;

    public function coreType() { return self::$id; }
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 11:        // originX
            case 12:        // originY
            case 257:       // animationsScrollOffset
                $reader->readFloat32();
                return true;

            case 236:       // defaultStateMachineId
            case 583:       // viewModelId
            case 584:       // viewModelInstanceId
                $reader->readVarUint();
                return true;
            
            case 267:       // expandedComponents
            case 283:       // expandedFolders
            case 291:       // selectedAnimations
                $reader->readListId();
                return true;
        }

        return parent::deserialize($propertyKey, $reader);
    }
}

class RiveAsset {
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 203:       // name
                $reader->readString();
                return true;
            case 209:       // parentId
                $reader->readVarUint();
                return true;
            case 205:       // order
                $reader->readFloat32();
                return true;
        }

        return false;
    }
}
class RiveFileAsset extends RiveAsset {
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 204:       // assetId
            case 211:       // size
            case 358:       // exportTypeValue
                $reader->readVarUint();
                return true;

            case 359:       // cdnUuid
            case 362:       // cdnBaseUrl
                $reader->readString();
                return true; 
        }

        return parent::deserialize($propertyKey, $reader);
    }
}
class RiveDrawableAsset extends RiveFileAsset {
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 207:       // width
            case 208:       // height
                $reader->readFloat32();
                return true;
        }

        return parent::deserialize($propertyKey, $reader);
    }
}
class RiveImageAsset extends RiveDrawableAsset {
    public static $id = 105;

    public function coreType() { return self::$id; }
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 241:       // format
                $reader->readVarUint();
                return true;
            case 242:       // quality
                $reader->readFloat32();
                return true;
        }

        return parent::deserialize($propertyKey, $reader);
    }
}
class RiveFileAssetContents {
    public static $id = 106;

    public function coreType() { return self::$id; }
    public function deserialize($propertyKey, $reader): bool {
        switch( $propertyKey ) {
            case 213:       // assetId
                $reader->readVarUint();
                return true;
            case 212:       // bytes
                $reader->readImage();
                return true;
        }

        return false;
    }
}
