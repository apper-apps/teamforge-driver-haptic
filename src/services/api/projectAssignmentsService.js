export const projectAssignmentsService = {
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
          { field: { Name: "role_c" } },
          { field: { Name: "joined_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "member_id_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords("project_assignment_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching project assignments:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async getByProjectId(projectId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "role_c" } },
          { field: { Name: "joined_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "member_id_c" } }
        ],
        where: [
          {
            FieldName: "project_id_c",
            Operator: "EqualTo",
            Values: [parseInt(projectId)]
          }
        ]
      };

      const response = await apperClient.fetchRecords("project_assignment_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching project assignments by project:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async getByMemberId(memberId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "role_c" } },
          { field: { Name: "joined_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "member_id_c" } }
        ],
        where: [
          {
            FieldName: "member_id_c",
            Operator: "EqualTo",
            Values: [parseInt(memberId)]
          }
        ]
      };

      const response = await apperClient.fetchRecords("project_assignment_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching project assignments by member:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async create(assignmentData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: `${assignmentData.role} - Project Assignment`,
          role_c: assignmentData.role,
          joined_at_c: assignmentData.joinedAt || new Date().toISOString(),
          project_id_c: parseInt(assignmentData.projectId),
          member_id_c: parseInt(assignmentData.memberId)
        }]
      };

      const response = await apperClient.createRecord("project_assignment_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create project assignments ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0]?.message || "Failed to create project assignment");
        }
        
        return successfulRecords[0]?.data || null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating project assignment:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async delete(projectId, memberId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // First find the assignment to get its ID
      const findParams = {
        fields: [{ field: { Name: "Name" } }],
        where: [
          {
            FieldName: "project_id_c",
            Operator: "EqualTo",
            Values: [parseInt(projectId)]
          },
          {
            FieldName: "member_id_c",
            Operator: "EqualTo",
            Values: [parseInt(memberId)]
          }
        ]
      };

      const findResponse = await apperClient.fetchRecords("project_assignment_c", findParams);
      
      if (!findResponse.success || !findResponse.data || findResponse.data.length === 0) {
        throw new Error("Assignment not found");
      }

      const assignmentId = findResponse.data[0].Id;

      const params = {
        RecordIds: [assignmentId]
      };

      const response = await apperClient.deleteRecord("project_assignment_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete project assignments ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0]?.message || "Failed to delete project assignment");
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting project assignment:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  }
};