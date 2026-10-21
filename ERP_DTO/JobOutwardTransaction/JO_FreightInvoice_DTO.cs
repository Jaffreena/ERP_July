using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    // ===================== HEADER =====================
    public class JO_FreightInvoiceHead_DTO
    {
        public long JOFTIH_Number { get; set; }

        [Display(Name = "Journal No.")]
        [StringLength(50)]
        public string JOFTIH_JournalNo { get; set; }

        [Display(Name = "Journal Date")]
        [DataType(DataType.Date)]
        public DateTime JOFTIH_JournalDate { get; set; }

        [Display(Name = "Vendor Invoice No.")]
        [StringLength(50)]
        public string JOFTIH_VendorInvoiceNo { get; set; }

        [Display(Name = "Vendor Invoice Date")]
        [DataType(DataType.Date)]
        public DateTime JOFTIH_VendorInvoiceDate { get; set; }

        [Display(Name = "Category")]
        [StringLength(20)]
        public string JOFTIH_Category { get; set; } = "DELIVERY NOTE";

        [Display(Name = "JW Vendor")]
        public long JOFTIH_JW_Vendor_Number { get; set; }
        public string JWV_JW_VendorName { get; set; }

        [Display(Name = "Currency")]
        public long JOFTIH_Currency_Number { get; set; }

        [Display(Name = "Tax Cluster")]
        public long JOFTIH_TCT_Number { get; set; }

        [Display(Name = "WHT")]
        public long? JOFTIH_WHT_Number { get; set; }

        [Display(Name = "RCM")]
        [StringLength(5)]
        public string JOFTIH_RCM { get; set; } = "No";

        [Display(Name = "Payment Terms")]
        [StringLength(50)]
        public string JOFTIH_PaymentTerms { get; set; }

        [Display(Name = "Method of payment")]
        [StringLength(50)]
        public string JOFTIH_PaymentMethod { get; set; }

        [Display(Name = "Remarks")]
        [StringLength(250)]
        public string JOFTIH_Remarks { get; set; }
    }

    // ===================== ITEM =====================
    public class JO_FreightInvoiceItem_DTO
    {
        public long JOFTII_Number { get; set; }
        public long JOFTII_JOFTIH_Number { get; set; }

        public long JOFTII_JOFRT_SVOH_Number { get; set; }
        public long JOFTII_JOFRT_SVOI_Number { get; set; }

        // generic link to Delivery Note / Receipt Note (by SourceCategory)
        public long JOFTII_JOMNH_Number { get; set; }
        public long JOFTII_JOMNI_Number { get; set; }

        [StringLength(20)]
        public string JOFTII_SourceCategory { get; set; } = "DELIVERY NOTE";

        public long JOFTII_JPRS_Number { get; set; }
        public long JOFTII_Item_Number { get; set; }
        public long? JOFTII_FromWH_Number { get; set; }
        public long? JOFTII_ToWH_Number { get; set; }
        public long JOFTII_UoM_Number { get; set; }

        public double JOFTII_Qty_Kgs { get; set; }
        public double JOFTII_Rate { get; set; }
        public double JOFTII_Amount { get; set; }

        public long JOFTII_SAC_Number { get; set; }
        public double JOFTII_GST_Amount { get; set; }

        public double JOFTII_WHT_Percent { get; set; }
        public double JOFTII_WH_TaxAmount { get; set; }

        [StringLength(5)]
        public string JOFTII_RCM { get; set; } = "No";

        [StringLength(20)]
        public string JOFTII_SVO_Assign { get; set; }

        // ---- display-only (Get SP result set 1) ----
        public string SourceNo { get; set; }
        public DateTime? SourceDate { get; set; }
        public string JPRS_ProcessName { get; set; }
        public string ItemGroup { get; set; }
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public string OuterDia { get; set; }
        public string Thickness { get; set; }
        public string Length { get; set; }
        public string ITM_Width { get; set; }
        public string MaterialGrade { get; set; }
        public string UnitCode { get; set; }
        public string SAC_Code { get; set; }
        public double DeliveredQty { get; set; }
        public double PrevInvoicedQty { get; set; }
        public string ServiceOrderNo { get; set; }
    }

    // ===================== ADDRESS =====================
    public class JO_FreightInvoiceAddress_DTO
    {
        public long JOFTIA_Number { get; set; }
        public long JOFTIA_JOFTIH_Number { get; set; }

        [Display(Name = "Address Type")]
        public long JOFTIA_ADTP_Number { get; set; }

        [Display(Name = "Address ID")]
        [StringLength(100)]
        public string JOFTIA_Address_ID { get; set; }

        [Display(Name = "Address")]
        [StringLength(1000)]
        public string JOFTIA_Address { get; set; }

        [StringLength(100)]
        public string JOFTIA_City { get; set; }

        [StringLength(100)]
        public string JOFTIA_State { get; set; }

        [StringLength(100)]
        public string JOFTIA_Country { get; set; }

        [StringLength(40)]
        public string JOFTIA_PIN { get; set; }

        [StringLength(60)]
        public string JOFTIA_GSTIN { get; set; }
    }

    // ===================== GST =====================
    public class JO_FreightInvoiceGST_DTO
    {
        public long JOFTIG_Number { get; set; }
        public long JOFTIG_JOFTIH_Number { get; set; }
        public long JOFTIG_JOFTII_Number { get; set; }
        public int JOFTIG_Index { get; set; }
        public long JOFTIG_GSTC_Number { get; set; }
        public long JOFTIG_GSTT_Number { get; set; }
        public long JOFTIG_GSTE_Number { get; set; }
        public double JOFTIG_AssessableValue { get; set; }
        public double JOFTIG_Percent { get; set; }
        public double JOFTIG_GST_Amount { get; set; }
    }

    // ===================== CREATE / EDIT WRAPPER =====================
    public class JO_FreightInvoiceCreate_DTO
    {
        public JO_FreightInvoiceCreate_DTO()
        {
            Header = new JO_FreightInvoiceHead_DTO();
            Items = new List<JO_FreightInvoiceItem_DTO>();
            Addresses = new List<JO_FreightInvoiceAddress_DTO>();
            GST = new List<JO_FreightInvoiceGST_DTO>();
        }

        public JO_FreightInvoiceHead_DTO Header { get; set; }
        public List<JO_FreightInvoiceItem_DTO> Items { get; set; }
        public List<JO_FreightInvoiceAddress_DTO> Addresses { get; set; }
        public List<JO_FreightInvoiceGST_DTO> GST { get; set; }
    }

    // ===================== SUMMARY LIST =====================
    public class JO_FreightInvoiceSummary_DTO
    {
        public long JOFTIH_Number { get; set; }
        public string JOFTIH_JournalNo { get; set; }
        public string JOFTIH_JournalDate { get; set; }
        public string JOFTIH_VendorInvoiceNo { get; set; }
        public string JOFTIH_VendorInvoiceDate { get; set; }
        public string JOFTIH_Category { get; set; }
        public string JOFTIH_RCM { get; set; }
        public string DN_List { get; set; }
        public string DN_Count { get; set; }
        public string SO_List { get; set; }
        public string JWV_JW_VendorName { get; set; }
        public string VendorGroup { get; set; }
        public string VendorCategory { get; set; }
        public string CurrencyCode { get; set; }
        public string TaxCluster { get; set; }
        public string WarehouseCode { get; set; }
        public string WH_TaxCode { get; set; }
        public int NoOfLineItems { get; set; }
        public decimal TotalQty { get; set; }
        public decimal Amount { get; set; }
        public decimal GST_Amount { get; set; }
        public decimal WHT_Amount { get; set; }
        public decimal TotalQtyKgs { get; set; }
    }

    public class JO_FreightInvoiceSummaryTotal_DTO
    {
        public decimal GrandTotalQty { get; set; }
        public decimal GrandTotalAmount { get; set; }
        public decimal GrandTotalGST { get; set; }
        public decimal GrandTotalWHT { get; set; }
        public decimal GrandTotalQtyKgs { get; set; }
    }

    // ===================== DETAILED LIST =====================
    public class JO_FreightInvoiceDetail_DTO
    {
        public long JOFTIH_Number { get; set; }
        public string JOFTIH_JournalNo { get; set; }
        public string JOFTIH_JournalDate { get; set; }
        public string JOFTIH_VendorInvoiceNo { get; set; }
        public string JOFTIH_VendorInvoiceDate { get; set; }
        public string JOFTIH_Category { get; set; }
        public string SourceNo { get; set; }
        public string SourceDate { get; set; }
        public string Vendor_DN_No { get; set; }
        public string Vendor_DN_Date { get; set; }
        public string ServiceOrderNo { get; set; }
        public string ServiceOrderDate { get; set; }
        public string JWV_JW_VendorName { get; set; }
        public string VendorGroup { get; set; }
        public string VendorCategory { get; set; }
        public string CurrencyCode { get; set; }
        public string TaxCluster { get; set; }
        public string WH_TaxCode { get; set; }
        public string JPRS_ProcessName { get; set; }
        public string ItemGroup { get; set; }
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public string OuterDia { get; set; }
        public string Thickness { get; set; }
        public string Length { get; set; }
        public string ITM_Width { get; set; }
        public string MaterialGrade { get; set; }
        public string UOM { get; set; }
        public string FromWH { get; set; }
        public string ToWH { get; set; }
        public long JOFTII_Number { get; set; }
        public decimal JOFTII_Qty { get; set; }
        public decimal JOFTII_Qty_Kgs { get; set; }
        public decimal JOFTII_Rate { get; set; }
        public decimal JOFTII_Amount { get; set; }
        public decimal JOFTII_GST_Amount { get; set; }
        public decimal JOFTII_WHT_Percent { get; set; }
        public decimal JOFTII_WH_TaxAmount { get; set; }
        public string JOFTII_RCM { get; set; }
    }

    public class JO_FreightInvoiceDetailTotal_DTO
    {
        public decimal TotalQty { get; set; }
        public decimal TotalQtyKgs { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal TotalGST { get; set; }
        public decimal TotalWHT { get; set; }
    }

    // ===================== DN / RN POPUP (generic via JOMNH/JOMNI) =====================
    public class JO_FreightInvoiceSourceGroup_DTO
    {
        public long JOMNH_Number { get; set; }
        public string JOMNH_No { get; set; }
        public DateTime? JOMNH_Date { get; set; }
        public double TotalQty { get; set; }
        public double TotalInvoicedQty { get; set; }
        public double RemainingQty { get; set; }
    }

    public class JO_FreightInvoiceSourceItem_DTO
    {
        public long JOMNH_Number { get; set; }
        public string JOMNH_No { get; set; }
        public DateTime? JOMNH_Date { get; set; }
        public long JOMNH_Vendor_Number { get; set; }
        public long JOMNH_Currency_Number { get; set; }
        public long JOMNH_WH_Number { get; set; }
        public string JOMNH_Remarks { get; set; }
        public long JOMNI_Number { get; set; }
        public long JPRS_Number { get; set; }
        public string ProcessName { get; set; }
        public long Item_Number { get; set; }
        public long UoM_Number { get; set; }
        public double DeliveredQty { get; set; }
        public double InvoicedQty { get; set; }
        public double RemainingQty { get; set; }
        public double UnitPrice { get; set; }
        public long? FromWH_Number { get; set; }
        public long? ToWH_Number { get; set; }
        public long JOFRT_SVOH_Number { get; set; }
        public long JOFRT_SVOI_Number { get; set; }
        public string ServiceOrderNo { get; set; }
        public double SO_Rate { get; set; }
        public int hasServiceOrder { get; set; }
        public string ItemGroup { get; set; }
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public string OuterDia { get; set; }
        public string Thickness { get; set; }
        public string Length { get; set; }
        public string ITM_Width { get; set; }
        public string MaterialGrade { get; set; }
        public string UOM { get; set; }
        public long SAC_Number { get; set; }
        public string SAC { get; set; }
    }

    // ===================== FREIGHT SERVICE ORDER =====================
    public class JO_FreightServiceOrderDropdown_DTO
    {
        public long JOFRT_SVOH_Number { get; set; }
        public string ServiceOrderNo { get; set; }
        public long JOFRT_SVOI_Number { get; set; }
    }

    public class JO_FreightServiceOrderItemInfo_DTO
    {
        public long JOFRT_SVOI_Number { get; set; }
        public double UnitPrice { get; set; }
    }

    public class JO_FreightServiceOrderAllowedQty_DTO
    {
        public double SO_Qty { get; set; }
        public double UsedQty { get; set; }
    }
}