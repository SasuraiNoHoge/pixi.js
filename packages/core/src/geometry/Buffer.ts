import { Runner } from '@pixi/runner';
import { GLBuffer } from './GLBuffer';

let UID = 0;
/* eslint-disable max-len */

/**
 * Can be Float32Array, UInt32Array, any typed arrays
 */
export interface IArrayBuffer extends ArrayBuffer
{

}

/**
 * Gives access to indexing and `length` field
 */
export interface ITypedArray extends IArrayBuffer
{
    readonly length: number;
    [index: number]: number;
    readonly BYTES_PER_ELEMENT: number;
}

/**
 * A wrapper for data so that it can be used and uploaded by WebGL
 *
 * @class
 * @memberof PIXI
 */
export class Buffer
{
    data: ITypedArray;
    static: boolean;
    index: boolean;
    _glBuffers: {[key: number]: GLBuffer};
    _updateID: number;
    id: number;
    disposeRunner: Runner;

    /**
     * @param {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} data the data to store in the buffer.
     * @param {boolean} [_static=true] `true` for static buffer
     * @param {boolean} [index=false] `true` for index buffer
     */
    constructor(data?: IArrayBuffer, _static = true, index = false)
    {
        /**
         * The data in the buffer, as a typed array
         *
         * @member {ArrayBuffer| SharedArrayBuffer | ArrayBufferView}
         */
        this.data = (data || new Float32Array(1)) as ITypedArray;

        /**
         * A map of renderer IDs to webgl buffer
         *
         * @private
         * @member {object<number, GLBuffer>}
         */
        this._glBuffers = {};

        this._updateID = 0;

        this.index = index;

        this.static = _static;

        this.id = UID++;

        this.disposeRunner = new Runner('disposeBuffer');
    }

    // TODO could explore flagging only a partial upload?
    /**
     * flags this buffer as requiring an upload to the GPU
     * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView} [data] the data to update in the buffer.
     */
    update(data: ITypedArray)
    {
        this.data = (data as ITypedArray) || this.data;
        this._updateID++;
    }

    /**
     * disposes WebGL resources that are connected to this geometry
     */
    dispose()
    {
        this.disposeRunner.emit(this, false);
    }

    /**
     * Destroys the buffer
     */
    destroy()
    {
        this.dispose();

        this.data = null;
    }

    /**
     * Helper function that creates a buffer based on an array or TypedArray
     *
     * @static
     * @param {ArrayBufferView | number[]} data the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
     * @return {PIXI.Buffer} A new Buffer based on the data provided.
     */
    static from(data: IArrayBuffer | number[])
    {
        if (data instanceof Array)
        {
            data = new Float32Array(data);
        }

        return new Buffer(data);
    }
}
