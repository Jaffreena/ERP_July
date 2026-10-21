using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    // ===================== CREATE / EDIT WRAPPER =====================
    public class JO_JobworkInvoiceCreate_DTO
    {
        public JO_JobworkInvoiceHead_DTO Header { get; set; }
        public List<JO_JobworkInvoiceItem_DTO> Items { get; set; }
        public List<JO_JobworkInvoiceAddress_DTO> Addresses { get; set; }
        public List<JO_JobworkInvoiceGST_DTO> GST { get; set; }

        public JO_JobworkInvoiceCreate_DTO()
        {
            Header = new JO_JobworkInvoiceHead_DTO();
            Items = new List<JO_JobworkInvoiceItem_DTO>();
            Addresses = new List<JO_JobworkInvoiceAddress_DTO>();
            GST = new List<JO_JobworkInvoiceGST_DTO>();
        }
    }

    // ===================== HEAD =====================
    public class JO_JobworkInvoiceHead_DTO
    {
        public long JOSVIH_Number { get; set; }

        [Display(Name = "Journal No.")]
        [StringLength(25)]
        public string JOSVIH_JournalNo { get; set; }

        [Display(Name = "Date")]
        [DataType(DataType.Date)]
        public DateTime JOSVIH_JournalDate { get; set; }

        [Display(Name = "Vendor Invoice No.")]
        [StringLength(25)]
        public string JOSVIH_VendorInvoiceNo { get; set; }

        [Display(Name = "Date")]
        [DataType(DataType.Date)]
        public DateTime JOSVIH_VendorInvoiceDate { get; set; }

        [Display(Name = "Material Segregation")]
        public long JOSVIH_MS_Number { get; set; }

        [Display(Name = "JW Vendor")]
        public long JOSVIH_JW_Vendor_Number { get; set; }
        public string? JOSVIH_JW_Vendor_Name { get; set; }      // display / search text

        [Display(Name = "Currency")]
        public long JOSVIH_Currency_Number { get; set; }

        [Display(Name = "Tax Cluster")]
        public long JOSVIH_TCT_Number { get; set; }

        [Display(Name = "WH Tax Code")]
        public long JOSVIH_WHT_Number { get; set; }

        [Display(Name = "Payment Terms")]
        [StringLength(50)]
        public string? JOSVIH_PaymentTerms { get; set; }

        [Display(Name = "Method of Payment")]
        [StringLength(50)]
        public string? JOSVIH_PaymentMethod { get; set; }

        [Display(Name = "Remarks")]
        [StringLength(250)]
        public string? JOSVIH_Remarks { get; set; }

        // audit (set from session in DAO)
        public long? CreatorCode { get; set; }
        public long? EditorCode { get; set; }

        public int? JW_Inv_Id { get; set; }
    }

    // ===================== ITEM =====================
    public class JO_JobworkInvoiceItem_DTO
    {
        public long JOSVII_JOSVIH_Number { get; set; }
        public long JOSVII_Number { get; set; }
        public long JOSVII_JORNH_Number { get; set; }
        public long JOSVII_JORNI_Number { get; set; }

        [Display(Name = "Service Order No.")]
        public long JOSVII_JOJWI_SVOH_Number { get; set; }
        public long JOSVII_JOJWI_SVOI_Number { get; set; }

        [Display(Name = "Vendor Delivery Note No.")]
        [StringLength(25)]
        public string? JOSVII_Vendor_DN_No { get; set; }

        [Display(Name = "Process")]
        public long JOSVII_JPRS_Number { get; set; }

        [Display(Name = "Item Code")]
        public long JOSVII_Item_Number { get; set; }

        [Display(Name = "UoM")]
        public long JOSVII_UoM_Number { get; set; }

        [Display(Name = "Current Invoice Qty")]
        public double JOSVII_Qty { get; set; }

        [Display(Name = "Unit Price")]
        public double JOSVII_UnitPrice { get; set; }

        [Display(Name = "Amount")]
        public double JOSVII_Amount { get; set; }

        [Display(Name = "SAC")]
        public long JOSVII_SAC_Number { get; set; }

        [Display(Name = "GST Amount")]
        public double JOSVII_GST_Amount { get; set; }

        [Display(Name = "WHT Percent")]
        public double JOSVII_WHT_Percent { get; set; }

        [Display(Name = "WH Tax Amount")]
        public double JOSVII_WH_TaxAmount { get; set; }

        // RECEIPT NOTE = SO came from RN item, INVOICE = SO picked in invoice grid
        [StringLength(20)]
        public string? JOSVII_SVO_Assign { get; set; }

        // ---- display only (not saved) ----
        public string? JORNH_RN_No { get; set; }
        public DateTime? JORNH_RN_Date { get; set; }
        public string? ServiceOrderNo { get; set; }
        public string? JPRS_ProcessName { get; set; }
        public string? ItemCode { get; set; }
        public string? ItemDescription { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? Length { get; set; }
        public string? MaterialGrade { get; set; }
        public string? ItemGroup { get; set; }
        public string? UOM { get; set; }
        public string? SAC_Code { get; set; }
        public double DeliveredQty { get; set; }          // RN received qty
        public double PrevInvoicedQty { get; set; }       // other invoices only
        public double RemainingQty { get; set; }
    }

    // ===================== ADDRESS =====================
    public class JO_JobworkInvoiceAddress_DTO
    {
        public long JOSVIA_JOSVIH_Number { get; set; }
        public long JOSVIA_Number { get; set; }
        public long JOSVIA_ADTP_Number { get; set; }

        [StringLength(25)]
        public string JOSVIA_Address_ID { get; set; }

        [StringLength(250)]
        public string? JOSVIA_Address { get; set; }

        [StringLength(25)]
        public string? JOSVIA_City { get; set; }

        [StringLength(25)]
        public string? JOSVIA_State { get; set; }

        [StringLength(25)]
        public string? JOSVIA_Country { get; set; }

        [StringLength(10)]
        public string? JOSVIA_PIN { get; set; }

        [StringLength(15)]
        public string? JOSVIA_GSTIN { get; set; }
    }

    // ===================== GST (saved rows) =====================
    public class JO_JobworkInvoiceGST_DTO
    {
        public long JOSVIG_JOSVIH_Number { get; set; }
        public long JOSVIG_JOSVII_Number { get; set; }
        public long JOSVIG_Number { get; set; }
        public int JOSVIG_Index { get; set; }
        public long JOSVIG_GSTC_Number { get; set; }
        public long JOSVIG_GSTT_Number { get; set; }
        public long JOSVIG_GSTE_Number { get; set; }
        public double JOSVIG_AssessableValue { get; set; }
        public double JOSVIG_Percent { get; set; }
        public double JOSVIG_GST_Amount { get; set; }

        // used only to map GST rows to the grid row before the item is saved
        public long JOSVII_JORNI_Number { get; set; }
    }

    // ===================== GST (calculation result : Id 12) =====================
    public class JO_JobworkInvoiceGstCalc_DTO
    {
        public long TaxIndex { get; set; }
        public string? TaxCategory { get; set; }
        public string? TaxType { get; set; }
        public string? TaxElement { get; set; }
        public string? TaxElementName { get; set; }
        public string? Chargeable { get; set; }
        public string? LoadonInventory { get; set; }
        public string? LoadonInventoryPercent { get; set; }
        public long Calculation { get; set; }
        public double? Percentage { get; set; }
        public double AssessableValue { get; set; }
        public double Amount { get; set; }
        public long? GSTCNumber { get; set; }
        public long? GSTTNumber { get; set; }
        public long? GSTENumber { get; set; }
    }

    // ===================== VENDOR LOOKUP (Id 5 / 10) =====================
    public class JO_JobworkInvoiceVendor_DTO
    {
        public long JWV_Number { get; set; }
        public string? JWV_JW_VendorName { get; set; }
        public long JWV_Currency_Number { get; set; }
        public string? CurrencyCode { get; set; }
        public int? DecimalPlaces { get; set; }
        public long JWV_WH_Number { get; set; }
        public int? JWV_CreditDays { get; set; }
        public string? JWV_PaymentTerms { get; set; }
        public string? JWV_PaymentMode { get; set; }
        public int JWV_WithholdTax { get; set; }          // 1 = WHT applicable
        public long TaxClusterNumber { get; set; }
        public string? TaxCluster { get; set; }
        public long TaxCode { get; set; }                 // WH Tax Code (0 if flag != 1)
    }

    public class JO_JobworkInvoiceTaxCluster_DTO          // Id 8
    {
        public long TaxClusterNumber { get; set; }
        public string? TaxCluster { get; set; }
    }

    public class JO_JobworkInvoiceWHT_DTO                 // Id 7
    {
        public int IncludeTax { get; set; }               // 1 = add GST to base
        public long TaxNumber { get; set; }
        public string? TaxCode { get; set; }
        public double TaxPercentage { get; set; }
    }

    // ===================== SERVICE ORDER DROPDOWN / ITEM INFO =====================
    public class JO_JobworkInvoiceServiceOrder_DTO        // JO_ServiceOrder_GetByVendor_SP
    {
        public long JOJWI_SVOH_Number { get; set; }
        public string? JOJWI_SVOH_ServiceOrderNo { get; set; }
        public long JOJWI_SVOI_Number { get; set; }
    }

    public class JO_JobworkInvoiceServiceOrderInfo_DTO    // JO_ServiceOrderItem_Info_SP
    {
        public long JOJWI_SVOI_Number { get; set; }
        public double JOJWI_SVOI_UnitPrice { get; set; }
        public double JOJWI_SVOI_Amount { get; set; }
        public double JOJWI_SVOI_Qty { get; set; }          // SO item total qty
        public double PrevInvoiceQty { get; set; }          // other invoices only (this invoice excluded by SP)
    }

    // ===================== RN POPUP =====================
    public class JO_JobworkInvoiceRN_DTO                  // JO_ReceiptNote_GroupItem_SP
    {
        public long JORNH_Number { get; set; }
        public long JORNH_MS_Number { get; set; }
        public string? JORNH_RN_No { get; set; }
        public DateTime JORNH_RN_Date { get; set; }
        public string? JORNH_VendorDC_No { get; set; }
        public DateTime? JORNH_VendorDC_Date { get; set; }
        public double TotalQty { get; set; }
        public double TotalInvoicedQty { get; set; }
        public double RemainingQty { get; set; }
    }

    public class JO_JobworkInvoiceRNItem_DTO              // JO_ReceiptNote_ForInvoice_SP
    {
        public long JORNH_Number { get; set; }
        public string? JORNH_RN_No { get; set; }
        public DateTime JORNH_RN_Date { get; set; }
        public string? JORNH_VendorDC_No { get; set; }
        public DateTime? JORNH_VendorDC_Date { get; set; }
        public long JORNH_MS_Number { get; set; }
        public long JORNH_JW_Vendor_Number { get; set; }
        public long JORNH_Currency_Number { get; set; }
        public long JORNH_WH_Number { get; set; }

        public long JORNI_Number { get; set; }
        public long JORNI_JPRS_Number { get; set; }
        public string? JPRS_ProcessName { get; set; }
        public long JORNI_Item_Number { get; set; }
        public long JORNI_UoM_Number { get; set; }
        public double ReceivedQty { get; set; }
        public double InvoicedQty { get; set; }
        public double RemainingQty { get; set; }
        public double JORNI_UnitPrice { get; set; }
        public long JORNI_JOJWI_SVOH_Number { get; set; }
        public long JORNI_JOJWI_SVOI_Number { get; set; }
        public string? ServiceOrderNo { get; set; }
        public int HasServiceOrder => JORNI_JOJWI_SVOH_Number > 0 ? 1 : 0;

        public string? ItemCode { get; set; }
        public string? ItemDescription { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? Length { get; set; }
        public string? MaterialGrade { get; set; }
        public string? ItemGroup { get; set; }
        public string? UOM { get; set; }
        public long? SAC_Number { get; set; }
        public string? SAC { get; set; }
    }

    // ===================== SUMMARY (List) =====================
    public class JO_JobworkInvoiceSummary_DTO
    {
        public long JOSVIH_Number { get; set; }
        public string? JOSVIH_JournalNo { get; set; }
        public DateTime JOSVIH_JournalDate { get; set; }
        public string? JOSVIH_VendorInvoiceNo { get; set; }
        public DateTime JOSVIH_VendorInvoiceDate { get; set; }
        public string? RN_List { get; set; }
        public int RN_Count { get; set; }
        public string? JWV_JW_VendorName { get; set; }
        public string? VendorGroup { get; set; }
        public string? VendorCategory { get; set; }
        public string? CurrencyCode { get; set; }
        public string? TaxCluster { get; set; }
        public string? WH_TaxCode { get; set; }
        public string? Segregation { get; set; }
        public string? WarehouseCode { get; set; }
        public int NoOfLineItems { get; set; }
        public double TotalQty { get; set; }
        public double TotalQty_Kgs { get; set; }
        public double Amount { get; set; }
        public double GST_Amount { get; set; }
        public double WH_TaxAmount { get; set; }
    }

    public class JO_JobworkInvoiceTotals_DTO
    {
        public double GrandTotalQty { get; set; }
        public double GrandTotalQtyKgs { get; set; }
        public double GrandTotalAmount { get; set; }
        public double GrandTotalGST { get; set; }
        public double GrandTotalWHT { get; set; }
    }

    // ===================== DETAILED (ListDetailed) =====================
    public class JO_JobworkInvoiceDetailed_DTO
    {
        public long JOSVIH_Number { get; set; }
        public string? JOSVIH_JournalNo { get; set; }
        public DateTime JOSVIH_JournalDate { get; set; }
        public string? JOSVIH_VendorInvoiceNo { get; set; }
        public DateTime JOSVIH_VendorInvoiceDate { get; set; }

        public long? JORNH_Number { get; set; }
        public string? JORNH_RN_No { get; set; }
        public DateTime? JORNH_RN_Date { get; set; }
        public string? JOSVII_Vendor_DN_No { get; set; }
        public DateTime? Vendor_DN_Date { get; set; }

        public string? JWV_JW_VendorName { get; set; }
        public string? VendorGroup { get; set; }
        public string? VendorCategory { get; set; }
        public string? CurrencyCode { get; set; }
        public string? TaxCluster { get; set; }
        public string? WH_TaxCode { get; set; }

        public long? JOSVII_Number { get; set; }
        public long? JOSVII_JOSVIH_Number { get; set; }
        public string? ServiceOrderNo { get; set; }
        public string? JPRS_ProcessName { get; set; }
        public string? ItemGroup { get; set; }
        public string? ItemCode { get; set; }
        public string? ItemDescription { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? Length { get; set; }
        public string? MaterialGrade { get; set; }
        public string? UOM { get; set; }
        public string? Segregation { get; set; }
        public string? WarehouseCode { get; set; }

        public double JOSVII_Qty { get; set; }
        public double JOSVII_Qty_Kgs { get; set; }
        public double JOSVII_UnitPrice { get; set; }
        public double JOSVII_Amount { get; set; }
        public double JOSVII_GST_Amount { get; set; }
        public double JOSVII_WHT_Percent { get; set; }
        public double JOSVII_WH_TaxAmount { get; set; }
    }

    public class JO_JobworkInvoiceDetailedTotals_DTO
    {
        public double TotalQty { get; set; }
        public double TotalQtyKgs { get; set; }
        public double TotalAmount { get; set; }
        public double TotalGST { get; set; }
        public double TotalWHT { get; set; }
    }
}
