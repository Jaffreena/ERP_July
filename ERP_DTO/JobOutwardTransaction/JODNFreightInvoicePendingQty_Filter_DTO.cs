using System;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JODNFreightInvoicePendingQty_Filter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string DN_No { get; set; }
        public string Freight_SO_No { get; set; }
        public long? JW_Vendor_Number { get; set; }
    }
}