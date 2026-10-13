using System.Collections.Generic;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JOJWI_Numbering_DTO
    {
        public int Id { get; set; }
        public int CreatorCode { get; set; }
        public string? DeleteNumbers { get; set; }

        public long JOJWI_Number { get; set; }
        public string? JOJWI_Method { get; set; }
        public string? JOJWI_Date { get; set; }
        public string? JOJWI_EndDate { get; set; }
        public string? JOJWI_StartingNumber { get; set; }
        public string? JOJWI_NumberofDigits { get; set; }
        public string? JOJWI_PrefilZero { get; set; }
        public string? JOJWI_Frequency { get; set; }
        public string? JOJWI_Particulars { get; set; }

        public List<JOJWI_NumberReset_DTO>? JOJWI_NumberReset { get; set; }
        public List<JOJWI_NumberPrefix_DTO>? JOJWI_NumberPrefix { get; set; }
        public List<JOJWI_NumberSuffix_DTO>? JOJWI_NumberSuffix { get; set; }

        public void Reset()
        {
            JOJWI_Number = 0;
            JOJWI_Method = null;
            JOJWI_Date = null;
            JOJWI_EndDate = null;
            JOJWI_StartingNumber = null;
            JOJWI_NumberofDigits = null;
            JOJWI_PrefilZero = null;
            JOJWI_Frequency = null;
            JOJWI_Particulars = null;
            DeleteNumbers = null;
            JOJWI_NumberReset = null;
            JOJWI_NumberPrefix = null;
            JOJWI_NumberSuffix = null;
        }
    }

    public class JOJWI_NumberReset_DTO
    {
        public long JOJWI_NRS_Number { get; set; }
        public string? JOJWI_NRS_StartDate { get; set; }
        public string? JOJWI_NRS_EndDate { get; set; }
        public string? JOJWI_NRS_StartingNumber { get; set; }
        public string? JOJWI_NRS_NumberofDigits { get; set; }
        public string? JOJWI_NRS_PrefilZero { get; set; }
        public string? JOJWI_NRS_Frequency { get; set; }
        public bool JOJWI_NRS_IsDeleted { get; set; }
    }

    public class JOJWI_NumberPrefix_DTO
    {
        public long JOJWI_PFX_Number { get; set; }
        public string? JOJWI_PFX_StartDate { get; set; }
        public string? JOJWI_PFX_EndDate { get; set; }
        public string? JOJWI_PFX_Particulars { get; set; }
        public bool JOJWI_PFX_IsDeleted { get; set; }
    }

    public class JOJWI_NumberSuffix_DTO
    {
        public long JOJWI_SFX_Number { get; set; }
        public string? JOJWI_SFX_StartDate { get; set; }
        public string? JOJWI_SFX_EndDate { get; set; }
        public string? JOJWI_SFX_Particulars { get; set; }
        public bool JOJWI_SFX_IsDeleted { get; set; }
    }
}