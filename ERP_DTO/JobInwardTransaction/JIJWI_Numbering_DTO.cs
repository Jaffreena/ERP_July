using System;
using System.Collections.Generic;

namespace ERP_DTO.JobInwardTransaction
{
    public class JIJWI_Numbering_DTO
    {
        public Int64 JIJWI_Number { get; set; }
        public String? JIJWI_Method { get; set; }
        public String? JIJWI_Date { get; set; }
        public String? JIJWI_EndDate { get; set; }
        public String? JIJWI_StartingNumber { get; set; }
        public String? JIJWI_NumberofDigits { get; set; }
        public String? JIJWI_PrefilZero { get; set; }
        public String? JIJWI_Frequency { get; set; }
        public String? JIJWI_Particulars { get; set; }

        public List<JIJWI_NumberReset_DTO>? JIJWI_NumberReset { get; set; }
        public List<JIJWI_NumberPrefix_DTO>? JIJWI_NumberPrefix { get; set; }
        public List<JIJWI_NumberSuffix_DTO>? JIJWI_NumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JIJWI_Number = 0;
            this.JIJWI_Date = "0";
            this.JIJWI_Method = "0";
            this.JIJWI_StartingNumber = "0";
            this.JIJWI_NumberofDigits = "0";
            this.JIJWI_PrefilZero = "0";
            this.JIJWI_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JIJWI_NumberReset = null;
            this.JIJWI_NumberPrefix = null;
            this.JIJWI_NumberSuffix = null;
        }
    }

    public class JIJWI_NumberReset_DTO
    {
        public Int64 JIJWI__NRS_Number { get; set; }
        public String? JIJWI__NRS_StartDate { get; set; }
        public String? JIJWI__NRS_EndDate { get; set; }
        public String? JIJWI__NRS_StartingNumber { get; set; }
        public String? JIJWI__NRS_NumberofDigits { get; set; }
        public String? JIJWI__NRS_PrefilZero { get; set; }
        public String? JIJWI__NRS_Frequency { get; set; }
        public Boolean JIJWI__NRS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIJWI__NRS_Number = 0;
            this.JIJWI__NRS_StartDate = "";
            this.JIJWI__NRS_EndDate = "";
            this.JIJWI__NRS_StartingNumber = "";
            this.JIJWI__NRS_NumberofDigits = "";
            this.JIJWI__NRS_PrefilZero = "";
            this.JIJWI__NRS_Frequency = "";
            this.JIJWI__NRS_IsDeleted = false;
        }
    }

    public class JIJWI_NumberPrefix_DTO
    {
        public Int64 JIJWI_PFX_Number { get; set; }
        public String? JIJWI_PFX_StartDate { get; set; }
        public String? JIJWI_PFX_EndDate { get; set; }
        public String? JIJWI_PFX_Particulars { get; set; }
        public Boolean JIJWI_PFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIJWI_PFX_Number = 0;
            this.JIJWI_PFX_StartDate = "";
            this.JIJWI_PFX_EndDate = "";
            this.JIJWI_PFX_Particulars = "";
            this.JIJWI_PFX_IsDeleted = false;
        }
    }

    public class JIJWI_NumberSuffix_DTO
    {
        public Int64 JIJWI_SFX_Number { get; set; }
        public String? JIJWI_SFX_StartDate { get; set; }
        public String? JIJWI_SFX_EndDate { get; set; }
        public String? JIJWI_SFX_Particulars { get; set; }
        public Boolean JIJWI_SFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIJWI_SFX_Number = 0;
            this.JIJWI_SFX_StartDate = "";
            this.JIJWI_SFX_EndDate = "";
            this.JIJWI_SFX_Particulars = "";
            this.JIJWI_SFX_IsDeleted = false;
        }
    }
}