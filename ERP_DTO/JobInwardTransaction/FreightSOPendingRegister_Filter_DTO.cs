namespace ERP_DTO.JobInwardTransaction
{
    public class FreightSOPendingRegister_Filter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? SO_No { get; set; }
        public long? JW_Customer_Number { get; set; }
        public long? PRS_Number { get; set; }
        public long? FromWH_Number { get; set; }
        public long? ToWH_Number { get; set; }
    }
}