//#region Interfaces
interface IBase64 extends IBaseService {
    encode(input: string): string;
    decode(input: string): string;
}
//#endregion

