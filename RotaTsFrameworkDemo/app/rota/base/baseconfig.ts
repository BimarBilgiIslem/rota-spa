﻿class BaseConfig<TConfig extends IBaseConfig> implements ng.IServiceProvider, IBaseConfigProvider<TConfig> {
    config: TConfig;

    configure(config: TConfig): void {
        this.config = angular.extend(this.config, config);
    }

    $get(): TConfig {
        return this.config;
    }
}
//Export
export { BaseConfig}