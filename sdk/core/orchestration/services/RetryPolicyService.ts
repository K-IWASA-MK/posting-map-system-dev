import { RetryProfile } from '../models/RetryProfile';

export class RetryPolicyService {
    public async waitBeforeRetry(profile: RetryProfile): Promise<void> {
        // Mock delay for backoff
        return new Promise(resolve => setTimeout(resolve, profile.retryDelay));
    }
}
