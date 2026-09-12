using System;
using System.Collections.Generic;

namespace ERP_DTO.JobInwardTransaction
{
    public class JIFTI_Numbering_DTO
    {
        public Int64 JIFTI_Number { get; set; }
        public String? JIFTI_Method { get; set; }
        public String? JIFTI_Date { get; set; }
        public String? JIFTI_EndDate { get; set; }
        public String? JIFTI_StartingNumber { get; set; }
        public String? JIFTI_NumberofDigits { get; set; }
        public String? JIFTI_PrefilZero { get; set; }
        public String? JIFTI_Frequency { get; set; }
        public String? JIFTI_Particulars { get; set; }

        public List<JIFTI_NumberReset_DTO>? JIFTI_NumberReset { get; set; }
        public List<JIFTI_NumberPrefix_DTO>? JIFTI_NumberPrefix { get; set; }
        public List<JIFTI_NumberSuffix_DTO>? JIFTI_NumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JIFTI_Number = 0;
            this.JIFTI_Date = "0";
            this.JIFTI_Method = "0";
            this.JIFTI_StartingNumber = "0";
            this.JIFTI_NumberofDigits = "0";
            this.JIFTI_PrefilZero = "0";
            this.JIFTI_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JIFTI_NumberReset = null;
            this.JIFTI_NumberPrefix = null;
            this.JIFTI_NumberSuffix = null;
        }
    }

    public class JIFTI_NumberReset_DTO
    {
        public Int64 JIFTI_NRS_Number { get; set; }
        public String? JIFTI_NRS_StartDate { get; set; }
        public String? JIFTI_NRS_EndDate { get; set; }
        public String? JIFTI_NRS_StartingNumber { get; set; }
        public String? JIFTI_NRS_NumberofDigits { get; set; }
        public String? JIFTI_NRS_PrefilZero { get; set; }
        public String? JIFTI_NRS_Frequency { get; set; }
        public Boolean JIFTI_NRS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIFTI_NRS_Number = 0;
            this.JIFTI_NRS_StartDate = "";
            this.JIFTI_NRS_EndDate = "";
            this.JIFTI_NRS_StartingNumber = "";
            this.JIFTI_NRS_NumberofDigits = "";
            this.JIFTI_NRS_PrefilZero = "";
            this.JIFTI_NRS_Frequency = "";
            this.JIFTI_NRS_IsDeleted = false;
        }
    }

    public class JIFTI_NumberPrefix_DTO
    {
        public Int64 JIFTI_PFX_Number { get; set; }
        public String? JIFTI_PFX_StartDate { get; set; }
        public String? JIFTI_PFX_EndDate { get; set; }
        public String? JIFTI_PFX_Particulars { get; set; }
        public Boolean JIFTI_PFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIFTI_PFX_Number = 0;
            this.JIFTI_PFX_StartDate = "";
            this.JIFTI_PFX_EndDate = "";
            this.JIFTI_PFX_Particulars = "";
            this.JIFTI_PFX_IsDeleted = false;
        }
    }

    public class JIFTI_NumberSuffix_DTO
    {
        public Int64 JIFTI_SFX_Number { get; set; }
        public String? JIFTI_SFX_StartDate { get; set; }
        public String? JIFTI_SFX_EndDate { get; set; }
        public String? JIFTI_SFX_Particulars { get; set; }
        public Boolean JIFTI_SFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIFTI_SFX_Number = 0;
            this.JIFTI_SFX_StartDate = "";
            this.JIFTI_SFX_EndDate = "";
            this.JIFTI_SFX_Particulars = "";
            this.JIFTI_SFX_IsDeleted = false;
        }
    }
}