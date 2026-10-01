namespace ERP_DTO.JobInwardTransaction
{
    public class RNFreightInvoicePendingQty_Filter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string RN_No { get; set; }
        public string JWC_DN_No { get; set; }
        public string Freight_SO_No { get; set; }
        public long? JW_Customer_Number { get; set; }
    }
}