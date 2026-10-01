using System;
using System.Collections.Generic;

namespace ERP_DTO.JobOutwardTransaction
{
    #region JO delivery note numbering

    public class JO_DNNumber_DTO
    {
        public Int64 JODN_NM_Number { get; set; }
        public String? JODN_NM_Method { get; set; }
        public String? JODN_NM_Date { get; set; }
        public String? JODN_NM_EndDate { get; set; }
        public String? JODN_NM_StartingNumber { get; set; }
        public String? JODN_NM_NumberofDigits { get; set; }
        public String? JODN_NM_PrefilZero { get; set; }
        public String? JODN_NM_Frequency { get; set; }
        public String? JODN_NM_Particulars { get; set; }

        public List<JODN_NumberReset_DTO>? JODN_NumberReset { get; set; }
        public List<JODN_NumberPrefix_DTO>? JODN_NumberPrefix { get; set; }
        public List<JODN_NumberSuffix_DTO>? JODN_NumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JODN_NM_Number = 0;
            this.JODN_NM_Date = "0";
            this.JODN_NM_Method = "0";
            this.JODN_NM_StartingNumber = "0";
            this.JODN_NM_NumberofDigits = "0";
            this.JODN_NM_PrefilZero = "0";
            this.JODN_NM_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JODN_NumberReset = null;
            this.JODN_NumberPrefix = null;
            this.JODN_NumberSuffix = null;
        }
    }

    public class JODN_NumberReset_DTO
    {
        public Int64 JODN_NR_Number { get; set; }
        public String? JODN_NR_Date { get; set; }
        public String? JODN_NR_EndDate { get; set; }
        public String? JODN_NR_StartingNumber { get; set; }
        public String? JODN_NR_NumberofDigits { get; set; }
        public String? JODN_NR_PrefilZero { get; set; }
        public String? JODN_NR_Frequency { get; set; }
        public Boolean JODN_NR_IsDeleted { get; set; }

        public void Reset()
        {
            this.JODN_NR_Number = 0;
            this.JODN_NR_Date = "";
            this.JODN_NR_EndDate = "";
            this.JODN_NR_StartingNumber = "";
            this.JODN_NR_NumberofDigits = "";
            this.JODN_NR_PrefilZero = "";
            this.JODN_NR_Frequency = "";
            this.JODN_NR_IsDeleted = false;
        }
    }

    public class JODN_NumberPrefix_DTO
    {
        public Int64 JODN_Prefix_Number { get; set; }
        public String? JODN_Prefix_Date { get; set; }
        public String? JODN_Prefix_EndDate { get; set; }
        public String? JODN_Prefix_Particulars { get; set; }
        public Boolean JODN_Prefix_IsDeleted { get; set; }

        public void Reset()
        {
            this.JODN_Prefix_Number = 0;
            this.JODN_Prefix_Date = "";
            this.JODN_Prefix_EndDate = "";
            this.JODN_Prefix_Particulars = "";
            this.JODN_Prefix_IsDeleted = false;
        }
    }

    public class JODN_NumberSuffix_DTO
    {
        public Int64 JODN_Suffix_Number { get; set; }
        public String? JODN_Suffix_Date { get; set; }
        public String? JODN_Suffix_EndDate { get; set; }
        public String? JODN_Suffix_Particulars { get; set; }
        public Boolean JODN_Suffix_IsDeleted { get; set; }

        public void Reset()
        {
            this.JODN_Suffix_Number = 0;
            this.JODN_Suffix_Date = "";
            this.JODN_Suffix_EndDate = "";
            this.JODN_Suffix_Particulars = "";
            this.JODN_Suffix_IsDeleted = false;
        }
    }

    public class JO_DN_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime DNDate { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalDNNumber { get; set; }
        public int CreatorCode { get; set; }
    }

    #endregion
}