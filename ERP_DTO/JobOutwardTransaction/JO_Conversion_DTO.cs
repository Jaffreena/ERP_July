using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    // ===================== SAVE (CREATE) =====================
    public class JOConversionCreate_DTO
    {
        public JOConversionHeader_DTO Header { get; set; } = new();

        // Consumption
        public List<JOConversionConsItem_DTO> Items { get; set; } = new();
        public List<JOConversionConsBatch_DTO> ConsBatches { get; set; } = new();

        // Production
        public List<JOConversionProdItem_DTO> Items_Production { get; set; } = new();
        public List<JOConversionProdBatch_DTO> ItemBatch_Production { get; set; } = new();

        // Scrap
        public List<JOConversionScrapItem_DTO> Items_Scrap { get; set; } = new();
        public List<JOConversionScrapBatch_DTO> ItemBatch_Scrap { get; set; } = new();
    }

    public class JOConversionHeader_DTO
    {
        public long JOCNVH_Number { get; set; }

        [Display(Name = "Conversion Journal No.")]
        [StringLength(25)]
        public string? JOCNVH_JournalNo { get; set; }

        [Display(Name = "Date")]
        [DataType(DataType.Date)]
        public DateTime JOCNVH_Date { get; set; }

        [Display(Name = "Material Segregation")]
        public long JOCNVH_MS_Number { get; set; }

        [Display(Name = "Shift")]
        public long JOCNVH_JSFT_Number { get; set; }

        [Display(Name = "Work Centre")]
        public long JOCNVH_JWWC_Number { get; set; }

        [Display(Name = "Process")]
        public long JOCNVH_JPRS_Number { get; set; }

        public int? CreatorCode { get; set; }
    }

    // ===================== CONSUMPTION =====================
    public class JOConversionConsItem_DTO
    {
        public int RowIndex { get; set; }                 // item grid row index (batch mapping)
        public long JOCNVC_JOCNVH_Number { get; set; }
        public long JOCNVC_Number { get; set; }

        public long JOCNVC_Item_Number { get; set; }
        public long JOCNVC_WH_Number { get; set; }
        public long JOCNVC_UoM_Number { get; set; }
        public double JOCNVC_ConsQty { get; set; }
        public double JOCNVC_ConsQty_Kgs { get; set; }

        // display only
        public string? Item_Code { get; set; }
        public string? Item_Description { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? Length { get; set; }
        public string? MaterialGrade { get; set; }
        public string? ItemGroup { get; set; }
        public string? UOM { get; set; }
        public string? Warehouse { get; set; }
    }

    public class JOConversionConsBatch_DTO
    {
        public long JOCNVC_BCH_Number { get; set; }
        public long JOCNVC_BCH_JOCNVH_Number { get; set; }
        public long JOCNVC_BCH_JOCNVC_Number { get; set; }

        public int ItemGridIndex { get; set; }            // which consumption row this batch belongs to
        public long ItemMasterNumber { get; set; }

        public long JOCNVC_BCH_WH_Number { get; set; }
        public DateTime JOCNVC_BCH_BatchDate { get; set; }
        public string? JOCNVC_BCH_BatchNo { get; set; }
        public decimal JOCNVC_BCH_BatchQty { get; set; }
        public decimal JOCNVC_BCH_BatchUnitPrice { get; set; }
        public decimal JOCNVC_BCH_BatchValue { get; set; }

        public long JOCNVC_BCH_RefBatch_Number { get; set; }   // source IN_COMMON_BATCH row
    }

    // ===================== PRODUCTION =====================
    public class JOConversionProdItem_DTO
    {
        public int RowIndex { get; set; }
        public long JOCNVP_Item_Number { get; set; }
        public long JOCNVP_WH_Number { get; set; }
        public long JOCNVP_UoM_Number { get; set; }

        [StringLength(15)]
        public string? JOCNVP_ItemStatus { get; set; } = "Good";

        public decimal JOCNVP_ProdQty { get; set; }
        public decimal JOCNVP_ProdQty_Kgs { get; set; }

        // display only
        public string? Item_Code { get; set; }
        public string? Item_Description { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? Length { get; set; }
        public string? MaterialGrade { get; set; }
        public string? ItemGroup { get; set; }
        public string? UOM { get; set; }
        public string? Warehouse { get; set; }
    }

    public class JOConversionProdBatch_DTO
    {
        public int JOCNVP_BCH_JOCNVP_Number { get; set; }     // = item RowIndex
        public long ItemMasterNumber { get; set; }
        public long JOCNVP_BCH_WH_Number { get; set; }
        public DateTime JOCNVP_BCH_BatchDate { get; set; }
        public string? JOCNVP_BCH_BatchNo { get; set; }

        [StringLength(15)]
        public string? JOCNVP_BCH_ItemStatus { get; set; } = "Good";

        public decimal JOCNVP_BCH_BatchQty { get; set; }
        public decimal JOCNVP_BCH_BatchUnitPrice { get; set; }
        public decimal JOCNVP_BCH_BatchValue { get; set; }
    }

    // ===================== SCRAP =====================
    public class JOConversionScrapItem_DTO
    {
        public int RowIndex { get; set; }
        public long JOCNVS_Item_Number { get; set; }
        public long JOCNVS_WH_Number { get; set; }
        public long JOCNVS_UoM_Number { get; set; }
        public decimal JOCNVS_ScrapQty { get; set; }

        // display only
        public string? Item_Code { get; set; }
        public string? Item_Description { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? Length { get; set; }
        public string? MaterialGrade { get; set; }
        public string? ItemGroup { get; set; }
        public string? UOM { get; set; }
        public string? Warehouse { get; set; }
    }

    public class JOConversionScrapBatch_DTO
    {
        public int JOCNVS_BCH_JOCNVS_Number { get; set; }     // = item RowIndex
        public long ItemMasterNumber { get; set; }
        public long JOCNVS_BCH_WH_Number { get; set; }
        public DateTime JOCNVS_BCH_BatchDate { get; set; }
        public string? JOCNVS_BCH_BatchNo { get; set; }
        public decimal JOCNVS_BCH_BatchQty { get; set; }
        public decimal JOCNVS_BCH_BatchUnitPrice { get; set; }
        public decimal JOCNVS_BCH_BatchValue { get; set; }
    }

    // ===================== TEMP (batch reservation, Temp_DeliveryNoteBatch) =====================
    public class JOConversionTempBatch_DTO
    {
        public int DBCH_Index { get; set; }               // item grid row
        public long DBCH_Item_Number { get; set; }
        public long DBCH_DBCH_Number { get; set; }        // source batch (LineBatch_Number)
        public long DBCH_Warehouse_Number { get; set; }
        public DateTime DBCH_Date { get; set; }
        public string? DBCH_No { get; set; }
        public decimal DBCH_Qty { get; set; }
        public decimal? DBCH_UnitPrice { get; set; }
        public decimal? DBCH_Value { get; set; }
        public int CreatorCode { get; set; }
    }

    public class JOConversionDeletedRowInfo_DTO
    {
        public int ItemGridindex { get; set; }
        public long DBCH_Item_Number { get; set; }
        public long DBCH_DBCH_Number { get; set; }
    }

    // ===================== BATCH POPUP (JO_Conversion_GetBatch_SP) =====================
    public class JOConversionBatchList_DTO
    {
        public long LineBatch_Number { get; set; }
        public long FromWarehouse { get; set; }
        public DateTime BatchDate { get; set; }
        public string? BatchNo { get; set; }
        public decimal BatchQty { get; set; }
        public decimal ReservedQty { get; set; }
        public decimal DeliveredQty { get; set; }
        public decimal AvailableQty { get; set; }
        public decimal BatchUnitPrice { get; set; }
        public decimal BatchValue { get; set; }
        public string? WarehouseCode { get; set; }
    }

    // ===================== MASTERS (JO_Conversion_SP Id 1) =====================
    public class JOConversionSegregation_DTO { public long Number { get; set; } public string? Segregation { get; set; } }
    public class JOConversionUoM_DTO { public long UnitNumber { get; set; } public string? UnitCode { get; set; } public int DecimalPlaces { get; set; } }
    public class JOConversionWarehouse_DTO { public long WarehouseNumber { get; set; } public string? WarehouseCode { get; set; } }
    public class JOConversionProcess_DTO
    {
        public long JPRS_Number { get; set; }
        public string? JPRS_ProcessName { get; set; }
        public long? JPRS_Cons_UoM_Number { get; set; }
        public long? JPRS_Prod_UoM_Number { get; set; }
        public long? JPRS_Scrap_UoM_Number { get; set; }
    }
    public class JOConversionShift_DTO { public long SFT_Number { get; set; } public string? SFT_ShiftName { get; set; } }
    public class JOConversionWorkCentre_DTO
    {
        public long JWWC_Number { get; set; }
        public string? JWWC_JW_WorkCentre { get; set; }
        public long JWWC_JPRS_Number { get; set; }
        public long JWWC_WH_Number { get; set; }
    }

    // ===================== SUMMARY (SP_JOCNV_Summary) =====================
    public class JOConversionSummary_DTO
    {
        public string? JOCNVH_JournalNo { get; set; }
        public long JOCNVH_Number { get; set; }
        public string? JOCNVH_Date { get; set; }
        public string? Segregation { get; set; }
        public string? SFT_ShiftName { get; set; }
        public string? JWWC_JW_WorkCentre { get; set; }
        public string? JPRS_ProcessName { get; set; }

        public int? Cons_NoOfLines { get; set; }
        public decimal? Cons_Qty { get; set; }
        public decimal? Cons_Qty_Kgs { get; set; }
        public string? Cons_UOMCode { get; set; }
        public string? Cons_WHCode { get; set; }

        public int? Prod_NoOfLines { get; set; }
        public decimal? Prod_Qty { get; set; }
        public decimal? Prod_Qty_Kgs { get; set; }
        public string? Prod_UOMCode { get; set; }
        public string? Prod_WHCode { get; set; }

        public int? Scrap_NoOfLines { get; set; }
        public decimal? Scrap_Qty { get; set; }
        public string? Scrap_UOMCode { get; set; }
        public string? Scrap_WHCode { get; set; }
    }

    // ===================== DETAILED (SP_JOCNV_Detailed) =====================
    public class JOConversionDetailed_DTO
    {
        public string? JOCNVH_JournalNo { get; set; }
        public long? JOCNVH_Number { get; set; }
        public string? JOCNVH_Date { get; set; }
        public string? Segregation { get; set; }
        public string? SFT_ShiftName { get; set; }
        public string? JWWC_JW_WorkCentre { get; set; }
        public string? JPRS_ProcessName { get; set; }

        public long? JOCNVC_Number { get; set; }
        public string? Cons_ItemCode { get; set; }
        public string? Cons_ItemDescription { get; set; }
        public string? Cons_OuterDia { get; set; }
        public string? Cons_Thickness { get; set; }
        public string? Cons_Length { get; set; }
        public string? Cons_MaterialGrade { get; set; }
        public string? Cons_ItemGroup { get; set; }
        public string? Cons_WHCode { get; set; }
        public string? Cons_UOMCode { get; set; }
        public decimal? JOCNVC_ConsQty { get; set; }
        public decimal? JOCNVC_ConsQty_Kgs { get; set; }

        public long? JOCNVP_Number { get; set; }
        public string? Prod_ItemCode { get; set; }
        public string? Prod_ItemDescription { get; set; }
        public string? Prod_OuterDia { get; set; }
        public string? Prod_Thickness { get; set; }
        public string? Prod_Length { get; set; }
        public string? Prod_MaterialGrade { get; set; }
        public string? Prod_ItemGroup { get; set; }
        public string? Prod_WHCode { get; set; }
        public string? Prod_UOMCode { get; set; }
        public string? JOCNVP_ItemStatus { get; set; }
        public decimal? JOCNVP_ProdQty { get; set; }
        public decimal? JOCNVP_ProdQty_Kgs { get; set; }

        public long? JOCNVS_Number { get; set; }
        public string? Scrap_ItemCode { get; set; }
        public string? Scrap_ItemDescription { get; set; }
        public string? Scrap_OuterDia { get; set; }
        public string? Scrap_Thickness { get; set; }
        public string? Scrap_Length { get; set; }
        public string? Scrap_MaterialGrade { get; set; }
        public string? Scrap_ItemGroup { get; set; }
        public string? Scrap_WHCode { get; set; }
        public string? Scrap_UOMCode { get; set; }
        public decimal? JOCNVS_ScrapQty { get; set; }
    }

    // ===================== NUMBERING (JOCNV_Numbering_SP) =====================
    public class JOConversionNumbering_DTO
    {
        public long JOCN_Number { get; set; }
        public long JOCN_Method { get; set; }
        public int JOCN_Date { get; set; }
        public int JOCN_EndDate { get; set; }
        public int JOCN_StartingNumber { get; set; }
        public int JOCN_NumberofDigits { get; set; }
        public long JOCN_PrefilZero { get; set; }
        public long JOCN_Frequency { get; set; }
        public string? JOCN_Particulars { get; set; }
        public string? DeleteNumbers { get; set; }
        public int CreatorCode { get; set; }
    }

    public class JOConversionNumberPage_DTO
    {
        public long JOCN_Number { get; set; }
        public string? JOCN_Method { get; set; }
        public List<JOConversionNumberReset_DTO> JOCNV_NumberReset { get; set; } = new();
        public List<JOConversionNumberPrefix_DTO> JOCNV_NumberPrefix { get; set; } = new();
        public List<JOConversionNumberSuffix_DTO> JOCNV_NumberSuffix { get; set; } = new();
    }

    public class JOConversionNumberReset_DTO
    {
        public long JOCR_Number { get; set; }
        public string? JOCR_Date { get; set; }
        public string? JOCR_EndDate { get; set; }
        public int JOCR_StartingNumber { get; set; }
        public int JOCR_NumberofDigits { get; set; }
        public long JOCR_PrefilZero { get; set; }
        public long JOCR_Frequency { get; set; }
        public bool JOCR_IsDeleted { get; set; }
    }

    public class JOConversionNumberPrefix_DTO
    {
        public long JOCP_Number { get; set; }
        public string? JOCP_Date { get; set; }
        public string? JOCP_EndDate { get; set; }
        public string? JOCP_Particulars { get; set; }
        public bool JOCP_IsDeleted { get; set; }
    }

    public class JOConversionNumberSuffix_DTO
    {
        public long JOCS_Number { get; set; }
        public string? JOCS_Date { get; set; }
        public string? JOCS_EndDate { get; set; }
        public string? JOCS_Particulars { get; set; }
        public bool JOCS_IsDeleted { get; set; }
    }
}
