using System.Collections.Generic;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_InvNumbering_DTO
    {
        public int Id { get; set; }
        public int CreatorCode { get; set; }
        public string? DeleteNumbers { get; set; }

        public long Number { get; set; }
        public string? Method { get; set; }
        public string? Date { get; set; }
        public string? EndDate { get; set; }
        public string? StartingNumber { get; set; }
        public string? NumberofDigits { get; set; }
        public string? PrefilZero { get; set; }
        public string? Frequency { get; set; }
        public string? Particulars { get; set; }

        public List<JO_InvNumReset_DTO>? NumberReset { get; set; }
        public List<JO_InvNumText_DTO>? NumberPrefix { get; set; }
        public List<JO_InvNumText_DTO>? NumberSuffix { get; set; }
    }

    public class JO_InvNumReset_DTO
    {
        public long Number { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? StartingNumber { get; set; }
        public string? NumberofDigits { get; set; }
        public string? PrefilZero { get; set; }
        public string? Frequency { get; set; }
        public bool IsDeleted { get; set; }
    }

    // used for both Prefix and Suffix rows
    public class JO_InvNumText_DTO
    {
        public long Number { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? Particulars { get; set; }
        public bool IsDeleted { get; set; }
    }
}