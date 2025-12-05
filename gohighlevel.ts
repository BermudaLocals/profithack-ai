import axios, { AxiosInstance } from 'axios';

export interface GoHighLevelContact {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  source?: string;
}

export interface GoHighLevelOpportunity {
  pipelineId: string;
  locationId: string;
  name: string;
  pipelineStageId: string;
  status: string;
  contactId: string;
  monetaryValue?: number;
  customFields?: Record<string, any>;
}

export class GoHighLevelService {
  private client: AxiosInstance;
  private locationId: string;

  constructor(apiKey: string, locationId: string) {
    this.locationId = locationId;
    this.client = axios.create({
      baseURL: 'https://services.leadconnectorhq.com',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28' // GHL API version
      }
    });
  }

  /**
   * Create or update a contact in GoHighLevel
   */
  async createContact(contact: GoHighLevelContact): Promise<any> {
    try {
      const payload = {
        ...contact,
        locationId: this.locationId,
      };

      console.log(`📤 Syncing contact to GHL: ${contact.email || contact.phone}`);
      
      const response = await this.client.post('/contacts/', payload);
      
      console.log(`✅ Contact synced to GHL: ${response.data.contact.id}`);
      return response.data.contact;
    } catch (error: any) {
      console.error('❌ Error creating contact in GHL:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update an existing contact in GoHighLevel
   */
  async updateContact(contactId: string, updates: Partial<GoHighLevelContact>): Promise<any> {
    try {
      console.log(`📤 Updating contact in GHL: ${contactId}`);
      
      const response = await this.client.put(`/contacts/${contactId}`, updates);
      
      console.log(`✅ Contact updated in GHL`);
      return response.data.contact;
    } catch (error: any) {
      console.error('❌ Error updating contact in GHL:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a contact by email or phone
   */
  async getContact(email?: string, phone?: string): Promise<any> {
    try {
      const params: any = {
        locationId: this.locationId
      };
      
      if (email) params.email = email;
      if (phone) params.phone = phone;

      const response = await this.client.get('/contacts/lookup', { params });
      
      if (response.data.contacts && response.data.contacts.length > 0) {
        return response.data.contacts[0];
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Error getting contact from GHL:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Add tags to a contact
   */
  async addTags(contactId: string, tags: string[]): Promise<void> {
    try {
      console.log(`🏷️ Adding tags to contact ${contactId}: ${tags.join(', ')}`);
      
      await this.client.post(`/contacts/${contactId}/tags`, { tags });
      
      console.log(`✅ Tags added to contact`);
    } catch (error: any) {
      console.error('❌ Error adding tags in GHL:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create an opportunity in the pipeline
   */
  async createOpportunity(opportunity: GoHighLevelOpportunity): Promise<any> {
    try {
      console.log(`📤 Creating opportunity in GHL pipeline: ${opportunity.name}`);
      
      const response = await this.client.post('/opportunities/', opportunity);
      
      console.log(`✅ Opportunity created in GHL: ${response.data.opportunity.id}`);
      return response.data.opportunity;
    } catch (error: any) {
      console.error('❌ Error creating opportunity in GHL:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get all pipelines for the location
   */
  async getPipelines(): Promise<any[]> {
    try {
      const response = await this.client.get(`/opportunities/pipelines`, {
        params: { locationId: this.locationId }
      });
      
      return response.data.pipelines || [];
    } catch (error: any) {
      console.error('❌ Error getting pipelines from GHL:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Verify webhook signature (for inbound webhooks from GHL)
   */
  static verifyWebhookSignature(payload: any, signature: string, publicKey: string): boolean {
    // GHL uses SHA256 signature verification
    // Implementation would go here using crypto module
    // For now, we'll return true (implement proper verification in production)
    return true;
  }

  /**
   * Sync a PROFITHACK user to GoHighLevel as a contact
   */
  async syncUserToContact(user: {
    email?: string;
    phone?: string;
    displayName?: string;
    username?: string;
    bio?: string;
  }, tags?: string[]): Promise<any> {
    try {
      // Check if contact exists
      const existingContact = await this.getContact(user.email, user.phone);
      
      const contactData: GoHighLevelContact = {
        email: user.email,
        phone: user.phone,
        name: user.displayName || user.username,
        firstName: user.displayName?.split(' ')[0],
        lastName: user.displayName?.split(' ').slice(1).join(' '),
        tags: tags || ['PROFITHACK User'],
        source: 'PROFITHACK AI Platform',
        customFields: {
          username: user.username,
          bio: user.bio,
          platform: 'PROFITHACK'
        }
      };

      if (existingContact) {
        // Update existing contact
        return await this.updateContact(existingContact.id, contactData);
      } else {
        // Create new contact
        return await this.createContact(contactData);
      }
    } catch (error: any) {
      console.error('❌ Error syncing user to GHL:', error);
      throw error;
    }
  }
}

export default GoHighLevelService;
