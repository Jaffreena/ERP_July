using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_ReceiptNoteDeletedRow_DTO
    {
        public int ItemGridindex { get; set; }
        public long JORNI_Number { get; set; }
        public long JORNH_Number { get; set; }
        public long DBCH_Item_Number { get; set; }
        public long DBCH_DBCH_Number { get; set; }
    }

    public class JO_ReceiptNoteCreate_DTO
    {
        public JO_ReceiptNoteHeader_DTO Header { get; set; }
        public List<JO_ReceiptNoteItem_DTO> Items { get; set; }
        public List<JO_ReceiptNoteBatch_DTO> receiptNoteBatches { get; set; }

        public JO_ReceiptNoteCreate_DTO()
        {
            Header = new JO_ReceiptNoteHeader_DTO();
            Items = new List<JO_ReceiptNoteItem_DTO>();
            receiptNoteBatches = new List<JO_ReceiptNoteBatch_DTO>();
        }
    }

    public class JO_ReceiptNoteHeader_DTO
    {
        public long JORNH_Number { get; set; }

        [Display(Name = "Receipt Note No.")]
        [StringLength(25)]
        public string JORNH_RN_No { get; set; }

        [Display(Name = "Date")]
        [DataType(DataType.Date)]
        public DateTime JORNH_RN_Date { get; set; }

        [Display(Name = "Vendor DC No.")]
        [StringLength(25)]
        public string JORNH_VendorDC_No { get; set; }

        [Display(Name = "Vendor DC Date")]
        [DataType(DataType.Date)]
        public DateTime JORNH_VendorDC_Date { get; set; }

        [Display(Name = "Material Segregation")]
        public long JORNH_MS_Number { get; set; }

        [Display(Name = "JW Vendor")]
        public long JORNH_JW_Vendor_Number { get; set; }
        public string? JORNI_Item_Code { get; set; } = null;      // vendor search text
        public string? JORNH_JW_Vendor_Name { get; set; }

        [Display(Name = "Currency")]
        public long JORNH_Currency_Number { get; set; }

        [Display(Name = "Warehouse")]
        public long JORNH_WH_Number { get; set; }

        [Display(Name = "Remarks")]
        [StringLength(250)]
        public string? JORNH_Remarks { get; set; }

        [Display(Name = "Freight Applicable")]
        [StringLength(10)]
        public string? JORNH_IsFreightApplicable { get; set; }

        public int? RN_Id { get; set; }
        public int? RN_CreatorCode { get; set; }

        // display only
        public string? JORNH_Warehouse { get; set; }
        public string? JORNH_CurrencyCode { get; set; }
        public string? JORNH_Segregation { get; set; }
    }

    public class JO_ReceiptNoteItem_DTO
    {
        public long JORNI_JORNH_Number { get; set; }
        public long JORNI_Number { get; set; }

        [Display(Name = "Process")]
        public long JORNI_JPRS_Number { get; set; }

        [Display(Name = "Item")]
        public long JORNI_Item_Number { get; set; }

        [Display(Name = "Warehouse")]
        public long JORNI_WH_Number { get; set; }

        [Display(Name = "UoM")]
        public long JORNI_UoM_Number { get; set; }

        [Display(Name = "Quantity")]
        public double JORNI_Qty { get; set; }

        [Display(Name = "Quantity (Kgs)")]
        public double JORNI_Qty_Kgs { get; set; }

        [Display(Name = "Unit Price")]
        public double JORNI_UnitPrice { get; set; }

        [Display(Name = "Amount")]
        public double JORNI_Amount { get; set; }

        [Display(Name = "JW Invoice Tracking")]
        [StringLength(10)]
        public string JORNI_IsJW_InvoiceApplicable { get; set; }

        public long? JORNI_JOJWI_SVOH_Number { get; set; }
        public long? JORNI_JOJWI_SVOI_Number { get; set; }

        [Display(Name = "Freight Applicable")]
        [StringLength(10)]
        public string? JORNI_IsFreightApplicable { get; set; }

        [Display(Name = "From Warehouse")]
        public long? JORNI_FromWH_Number { get; set; }

        [Display(Name = "To Warehouse")]
        public long? JORNI_ToWH_Number { get; set; }

        [Display(Name = "Freight No")]
        public long? JORNI_JOFRT_SVOH_Number { get; set; }
        public long? JORNI_JOFRT_SVOI_Number { get; set; }

        // Edit page : Original / Used qty
        public double JORNI_OriginalQty { get; set; }
        public double JORNI_UsedQty { get; set; }

        // display only
        public string? JORNI_JW_ProcessName { get; set; }
        public string? JORNI_Item_Code { get; set; }
        public string? JORNI_Item_Description { get; set; }
        public string? JORNI_OuterDia { get; set; }
        public string? JORNI_Thickness { get; set; }
        public string? JORNI_Length { get; set; }
        public string? JORNI_MaterialGrade { get; set; }
        public string? JORNI_ItemGroup { get; set; }
        public string? JORNI_UOM { get; set; }
        public string? JORNI_Warehouse { get; set; }
        public string? JORNI_IsDeleted { get; set; }
        public long? VendorNumber { get; set; }
    }

    public class JO_ReceiptNoteBatch_DTO
    {
        public long JORNI_BCH_Number { get; set; }
        public long JORNI_BCH_JORNH_Number { get; set; }
        public long JORNI_BCH_JORNI_Number { get; set; }
        public long JORNI_BCH_WH_Number { get; set; }
        public DateTime JORNI_BCH_BatchDate { get; set; }
        public string JORNI_BCH_BatchNo { get; set; }
        public decimal JORNI_BCH_BatchQty { get; set; }
        public decimal JORNI_BCH_BatchUnitPrice { get; set; }
        public decimal JORNI_BCH_BatchValue { get; set; }
        public long JORNI_BCH_Ref_Batch { get; set; }
        public decimal JORNI_BCH_UsedQty { get; set; }

        public long RefBatch_Number { get; set; }
        public long JORNH_Number { get; set; }
        public long JORNI_Number { get; set; }
    }

    public class TempJO_ReceiptBatch_DTO
    {
        public string? DBCH_RowGuid { get; set; }
        public long DBCH_Number { get; set; }               // >0 = existing saved batch row
        public int DBCH_Index { get; set; }
        public long? DBCH_DBCH_Number { get; set; }          // stock (source) batch number
        public long DBCH_Item_Number { get; set; }
        public long? JORNI_NUMBER { get; set; }
        public long? JORNH_NUMBER { get; set; }
        public long? RefBatch_Number { get; set; }
        public long DBCH_Warehouse_Number { get; set; }
        public DateTime DBCH_Date { get; set; }
        public string DBCH_No { get; set; }
        public decimal DBCH_Qty { get; set; }
        public decimal? DBCH_UnitPrice { get; set; }
        public decimal? DBCH_Value { get; set; }
        public int? Mode { get; set; }
        public int CreatorCode { get; set; }
        public DateTime CreatorDate { get; set; }
    }

    public class InCommonBatch_DTO
    {
        public string TransType { get; set; }
        public long Header_Number { get; set; }
        public long LineItem_Number { get; set; }
        public long Item_Number { get; set; }
        public long LineBatch_Number { get; set; }
        public long Warehouse { get; set; }
        public DateTime BatchDate { get; set; }
        public string BatchNo { get; set; }
        public string ItemStatus { get; set; }
        public decimal BatchQty { get; set; }
        public decimal BatchUnitPrice { get; set; }
        public decimal BatchValue { get; set; }
    }

    public class JO_ReceiptNoteSummary_DTO
    {
        public long JORNH_Number { get; set; }
        public int RN_Id { get; set; }
        public int RN_CreatorCode { get; set; }

        public string? JORNH_RN_No { get; set; }
        public DateTime JORNH_RN_Date { get; set; }
        public string? JORNH_VendorDC_No { get; set; }
        public DateTime? JORNH_VendorDC_Date { get; set; }

        public long JORNH_JW_Vendor_Number { get; set; }
        public long JWV_JVG_Number { get; set; }
        public string? JVG_JW_VendorGroup { get; set; }
        public string? JVC_JW_VendorCategory { get; set; }
        public string? JWV_JW_VendorName { get; set; }

        public string? CurrencyCode { get; set; }
        public string? WarehouseCode { get; set; }
        public long JORNH_MS_Number { get; set; }
        public string? Segregation { get; set; }
        public string? JORNH_IsFreightApplicable { get; set; }

        public int NoOfLineItems { get; set; }
        public string? Qty { get; set; }
        public double Amount { get; set; }

        public string? VendorWareHouse { get; set; }
        public string? ItemWareHouse { get; set; }

        // comma-separated, same order
        public string? JW_SO_No { get; set; }
        public string? JW_SO_Date { get; set; }
        public string? Freight_SO_No { get; set; }
        public string? Freight_SO_Date { get; set; }
    }

    public class JO_ReceiptNoteDetailed_DTO
    {
        public long JORNH_Number { get; set; }
        public string? JORNH_RN_No { get; set; }
        public DateTime JORNH_RN_Date { get; set; }
        public string? JORNH_VendorDC_No { get; set; }
        public DateTime? JORNH_VendorDC_Date { get; set; }

        public long JORNH_JW_Vendor_Number { get; set; }
        public long JWV_JVG_Number { get; set; }
        public string? JVG_JW_VendorGroup { get; set; }
        public string? JVC_JW_VendorCategory { get; set; }
        public string? JWV_JW_VendorName { get; set; }

        public string? CurrencyCode { get; set; }
        public string? WarehouseCode { get; set; }
        public long JORNH_MS_Number { get; set; }

        public string? VendorWareHouse { get; set; }
        public string? ItemWareHouse { get; set; }
        public string? Segregation { get; set; }

        public long JORNI_JPRS_Number { get; set; }
        public long JORNI_Item_Number { get; set; }
        public string? Process { get; set; }
        public string? ItemGroup { get; set; }
        public string? ItemCode { get; set; }
        public string? ItemDescription { get; set; }
        public decimal? OuterDia { get; set; }
        public decimal? Thickness { get; set; }
        public decimal? ItemLength { get; set; }
        public string? MaterialGrade { get; set; }
        public string? Warehouse { get; set; }
        public string? UOM { get; set; }

        public decimal JORNI_Qty { get; set; }
        public decimal JORNI_Qty_Kgs { get; set; }
        public decimal JORNI_UnitPrice { get; set; }
        public decimal JORNI_Amount { get; set; }
        public string? JORNI_IsJW_InvoiceApplicable { get; set; }
        public string? JORNI_IsFreightApplicable { get; set; }

        public string? JW_SO_No { get; set; }
        public DateTime? JW_SO_Date { get; set; }
        public string? Freight_SO_No { get; set; }
        public DateTime? Freight_SO_Date { get; set; }
    }
}