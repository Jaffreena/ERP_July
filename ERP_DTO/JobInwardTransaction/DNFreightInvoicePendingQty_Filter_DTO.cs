namespace ERP_DTO.JobInwardTransaction
{
    public class DNFreightInvoicePendingQty_Filter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string DN_No { get; set; }
        public string Freight_SO_No { get; set; }
        public long? JW_Customer_Number { get; set; }
    }
}