interface IShellScope extends ng.IScope {
    currentLanguage: ILanguage;
    currentUser: IUser;
    supportedLanguages?: ILanguage[];
    enableDebugPanel?: boolean;
    modelInDebug?: any;
    authorizedCompanies?: ICompany[];
    currentCompany?: ICompany;
    avatarUri?: string;
}

