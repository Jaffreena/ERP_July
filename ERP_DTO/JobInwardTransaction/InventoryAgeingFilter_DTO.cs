namespace ERP_DTO.JobInwardTransaction
{
    public class InventoryAgeingFilter_DTO
    {
        public DateTime? ClosingDate { get; set; }
        public long? ItemGroupNumber { get; set; }
        public long? WarehouseNumber { get; set; }
        public long? ItemNumber { get; set; }
    }

    public class AgeingBucketRange_DTO
    {
        public int From { get; set; }
        public int? To { get; set; }   // null = open-ended last bucket ("> From")
    }
}