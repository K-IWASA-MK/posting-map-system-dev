import { AIOSBootstrap } from '../bootstrap/AIOSBootstrap';
import { IAIOSPlugin } from '../contracts';

export class AIOSBuilder {
  private useLearningOS: boolean = false;
  private useKnowledgeOS: boolean = false;
  private useObservabilityOS: boolean = false;
  private useExecutionOS: boolean = false;
  private useGovernanceOS: boolean = false;
  private plugins: IAIOSPlugin[] = [];

  public useLearning(): this {
    this.useLearningOS = true;
    return this;
  }

  public useKnowledge(): this {
    this.useKnowledgeOS = true;
    return this;
  }

  public useObservability(): this {
    this.useObservabilityOS = true;
    return this;
  }

  public useExecution(): this {
    this.useExecutionOS = true;
    return this;
  }

  public useGovernance(): this {
    this.useGovernanceOS = true;
    return this;
  }

  public usePlugin(plugin: IAIOSPlugin): this {
    this.plugins.push(plugin);
    return this;
  }

  public build(): AIOSBootstrap {
    return new AIOSBootstrap({
      learning: this.useLearningOS,
      knowledge: this.useKnowledgeOS,
      observability: this.useObservabilityOS,
      execution: this.useExecutionOS,
      governance: this.useGovernanceOS,
      plugins: [...this.plugins],
    });
  }
}
