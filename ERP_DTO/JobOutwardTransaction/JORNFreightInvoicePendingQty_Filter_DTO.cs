using System;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JORNFreightInvoicePendingQty_Filter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string RN_No { get; set; }
        public string VendorDN_No { get; set; }
        public string Freight_SO_No { get; set; }
        public long? JW_Vendor_Number { get; set; }
    }
}