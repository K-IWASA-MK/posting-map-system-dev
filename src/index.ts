import { AIOSBuilder } from '@kiwasa/aios-core';
import { PostingMapPlugin } from './plugins/posting-map/PostingMapPlugin';

export const startPostingMap = async () => {
    const aios = new AIOSBuilder()
        .useLearning()
        .useKnowledge()
        .useObservability()
        .useGovernance()
        .useExecution()
        .usePlugin(new PostingMapPlugin())
        .build();

    await aios.start();
    return aios;
};

export { PostingMapPlugin };
