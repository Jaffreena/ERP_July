using System.Collections.Generic;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JOFTI_Numbering_DTO
    {
        public int Id { get; set; }
        public int CreatorCode { get; set; }
        public string? DeleteNumbers { get; set; }

        public long JOFTI_Number { get; set; }
        public string? JOFTI_Method { get; set; }
        public string? JOFTI_Date { get; set; }
        public string? JOFTI_EndDate { get; set; }
        public string? JOFTI_StartingNumber { get; set; }
        public string? JOFTI_NumberofDigits { get; set; }
        public string? JOFTI_PrefilZero { get; set; }
        public string? JOFTI_Frequency { get; set; }
        public string? JOFTI_Particulars { get; set; }

        public List<JOFTI_NumberReset_DTO>? JOFTI_NumberReset { get; set; }
        public List<JOFTI_NumberPrefix_DTO>? JOFTI_NumberPrefix { get; set; }
        public List<JOFTI_NumberSuffix_DTO>? JOFTI_NumberSuffix { get; set; }

        public void Reset()
        {
            JOFTI_Number = 0;
            JOFTI_Method = null;
            JOFTI_Date = null;
            JOFTI_EndDate = null;
            JOFTI_StartingNumber = null;
            JOFTI_NumberofDigits = null;
            JOFTI_PrefilZero = null;
            JOFTI_Frequency = null;
            JOFTI_Particulars = null;
            DeleteNumbers = null;
            JOFTI_NumberReset = null;
            JOFTI_NumberPrefix = null;
            JOFTI_NumberSuffix = null;
        }
    }

    public class JOFTI_NumberReset_DTO
    {
        public long JOFTI_NRS_Number { get; set; }
        public string? JOFTI_NRS_StartDate { get; set; }
        public string? JOFTI_NRS_EndDate { get; set; }
        public string? JOFTI_NRS_StartingNumber { get; set; }
        public string? JOFTI_NRS_NumberofDigits { get; set; }
        public string? JOFTI_NRS_PrefilZero { get; set; }
        public string? JOFTI_NRS_Frequency { get; set; }
        public bool JOFTI_NRS_IsDeleted { get; set; }
    }

    public class JOFTI_NumberPrefix_DTO
    {
        public long JOFTI_PFX_Number { get; set; }
        public string? JOFTI_PFX_StartDate { get; set; }
        public string? JOFTI_PFX_EndDate { get; set; }
        public string? JOFTI_PFX_Particulars { get; set; }
        public bool JOFTI_PFX_IsDeleted { get; set; }
    }

    public class JOFTI_NumberSuffix_DTO
    {
        public long JOFTI_SFX_Number { get; set; }
        public string? JOFTI_SFX_StartDate { get; set; }
        public string? JOFTI_SFX_EndDate { get; set; }
        public string? JOFTI_SFX_Particulars { get; set; }
        public bool JOFTI_SFX_IsDeleted { get; set; }
    }
}