import { KnowledgeRequest } from '../contracts/KnowledgeRequest';
import { KnowledgeDiscoveryResult } from './KnowledgeDiscoveryResult';

export interface IKnowledgeSourceResolver {
  resolve(request: KnowledgeRequest): Promise<KnowledgeDiscoveryResult>;
}
