export const teamsService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "avatar_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords("team_member_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching team members:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "avatar_c" } }
        ]
      };

      const response = await apperClient.getRecordById("team_member_c", parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching team member with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async create(memberData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: memberData.name,
          email_c: memberData.email,
          role_c: memberData.role,
          avatar_c: memberData.avatar || ""
        }]
      };

      const response = await apperClient.createRecord("team_member_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create team members ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0]?.message || "Failed to create team member");
        }
        
        return successfulRecords[0]?.data || null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating team member:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async update(id, memberData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const updateData = {
        Id: parseInt(id)
      };
      
      if (memberData.name !== undefined) updateData.Name = memberData.name;
      if (memberData.email !== undefined) updateData.email_c = memberData.email;
      if (memberData.role !== undefined) updateData.role_c = memberData.role;
      if (memberData.avatar !== undefined) updateData.avatar_c = memberData.avatar;

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord("team_member_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update team members ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0]?.message || "Failed to update team member");
        }
        
        return successfulUpdates[0]?.data || null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating team member:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord("team_member_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete team members ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0]?.message || "Failed to delete team member");
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting team member:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  }
};