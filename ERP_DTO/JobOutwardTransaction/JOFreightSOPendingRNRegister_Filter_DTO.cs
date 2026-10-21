using System;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JOFreightSOPendingRNRegister_Filter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string SO_No { get; set; }
        public long? JW_Vendor_Number { get; set; }
        public long? JPRS_Number { get; set; }
        public long? FromWH_Number { get; set; }
        public long? ToWH_Number { get; set; }
    }
}