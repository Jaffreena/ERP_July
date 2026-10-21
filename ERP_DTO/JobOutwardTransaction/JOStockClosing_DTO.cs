using System;

namespace ERP_DTO.JobOutwardTransaction
{
    // used by JO Stock Closing and JO Stock Closing Batch
    public class JOStockClosingFilter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public long? ItemGroupNumber { get; set; }
        public long? WarehouseNumber { get; set; }
        public long? ItemNumber { get; set; }
    }

    // used by JO Inventory Ageing
    public class JOInventoryAgeingFilter_DTO
    {
        public DateTime? ClosingDate { get; set; }
        public long? ItemGroupNumber { get; set; }
        public long? WarehouseNumber { get; set; }
        public long? ItemNumber { get; set; }
    }

    public class JOAgeingBucketRange_DTO
    {
        public int From { get; set; }
        public int? To { get; set; }   // null = open-ended last bucket ("> From")
    }

    // view model for the 3 JO report pages (Index.cshtml only needs an empty model)
    public class JOStockClosingReport_DTO
    {
        public JOStockClosingFilter_DTO Filter { get; set; } = new();
    }
}