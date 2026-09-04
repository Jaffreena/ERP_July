using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class JobWorkInvoiceHead_DTO
    {
        public long JIJWIH_Number { get; set; }

        [Display(Name = "JW Invoice No.")]
        [StringLength(25)]
        public string JIJWIH_InvoiceNo { get; set; }

        [Display(Name = "Invoice Date")]
        [DataType(DataType.Date)]
        public DateTime JIJWIH_InvoiceDate { get; set; }
        [Display(Name = "Material Segregation")]
        public long JIJWIH_MS_Number { get; set; }
        [Display(Name = "JW Customer")]
        public long JIJWIH_JW_Customer_Number { get; set; }
        public string JIJWIH_JW_Customer_Name { get; set; }


        [Display(Name = "Currency")]
        public long JIJWIH_Currency_Number { get; set; }

        [Display(Name = "Tax Cluster")]
        public long JIJWIH_TCT_Number { get; set; }

        [Display(Name = "Payment Terms")]
        [StringLength(50)]
        public string JIJWIH_PaymentTerms { get; set; }

        [Display(Name = "Method of payment")]
        [StringLength(50)]
        public string JIJWIH_PaymentMethod { get; set; }

        [Display(Name = "Remarks")]
        [StringLength(250)]
        public string JIJWIH_Remarks { get; set; }
        public int? JW_Inv_Id { get; set; }
    }
    public class JobWorkInvoiceItem_DTO
    {
        public long JIJWII_JIJWIH_Number { get; set; }

        public long JIJWII_JIDNI_Number { get; set; }
        public long? JIJWII_JISVOI_Number { get; set; }


        public long JIJWII_Number { get; set; }

        [Display(Name = "JW Order")]
        public long JIJWII_JISVOH_Number { get; set; }

        [Display(Name = "Delivery Note")]
        public long JIJWII_JIDNH_Number { get; set; }

        [Display(Name = "PRS Number")]
        public long JIJWII_PRS_Number { get; set; }

        [Display(Name = "Item")]
        public long JIJWII_Item_Number { get; set; }

        [Display(Name = "UOM")]
        public long JIJWII_UoM_Number { get; set; }

        [Display(Name = "Qty")]
        public double JIJWII_Qty { get; set; }

        [Display(Name = "Unit Price")]
        public double JIJWII_UnitPrice { get; set; }

        [Display(Name = "Amount")]
        public double JIJWII_Amount { get; set; }

        [Display(Name = "SAC")]
        public long JIJWII_SAC_Number { get; set; }

        [Display(Name = "GST Amount")]
        public double JIJWII_GST_Amount { get; set; }
        [Display(Name = "SO Assign")]
        public string JIJWII_SVO_Assign { get; set; }
    }

    public class JobWorkInvoiceAddress_DTO
    {
        public long JIJWIA_JIJWIH_Number { get; set; }

        public long JIJWIA_Number { get; set; }

        [Display(Name = "Address Type")]
        public long JIJWIA_ADTP_Number { get; set; }

        [Display(Name = "Address ID")]
        [StringLength(25)]
        public string JIJWIA_Address_ID { get; set; }

        [Display(Name = "Address")]
        [StringLength(250)]
        public string JIJWIA_Address { get; set; }

        [Display(Name = "City")]
        [StringLength(25)]
        public string JIJWIA_City { get; set; }

        [Display(Name = "State")]
        [StringLength(25)]
        public string JIJWIA_State { get; set; }

        [Display(Name = "Country")]
        [StringLength(25)]
        public string JIJWIA_Country { get; set; }

        [Display(Name = "PIN")]
        [StringLength(10)]
        public string JIJWIA_PIN { get; set; }

        [Display(Name = "GSTIN")]
        [StringLength(15)]
        public string JIJWIA_GSTIN { get; set; }
    }
    public class JobWorkInvoiceGST_DTO
    {
        public long JIJWIG_JIJWIH_Number { get; set; }

        public long JIJWIG_JIJWII_Number { get; set; }

        public long JIJWIG_Number { get; set; }

        [Display(Name = "Index")]
        public int JIJWIG_Index { get; set; }

        [Display(Name = "GST Category")]
        public long JIJWIG_GSTC_Number { get; set; }

        [Display(Name = "GST Type")]
        public long JIJWIG_GSTT_Number { get; set; }

        [Display(Name = "GST Element")]
        public long JIJWIG_GSTE_Number { get; set; }

        [Display(Name = "Assessable Value")]
        public double JIJWIG_AssessableValue { get; set; }

        [Display(Name = "Percent")]
        public double JIJWIG_Percent { get; set; }

        [Display(Name = "GST Amount")]
        public double JIJWIG_GST_Amount { get; set; }
        [Display(Name = "SO Assign")]
        public string JIJWII_SVO_Assign { get; set; }
    }
    public class JobWorkInvoiceCreate_DTO
    {
        public JobWorkInvoiceCreate_DTO()
        {
            Header = new JobWorkInvoiceHead_DTO();

            Items = new List<JobWorkInvoiceItem_DTO>();

            Addresses = new List<JobWorkInvoiceAddress_DTO>();

            GST = new List<JobWorkInvoiceGST_DTO>();
        }

        public JobWorkInvoiceHead_DTO Header { get; set; }

        public List<JobWorkInvoiceItem_DTO> Items { get; set; }

        public List<JobWorkInvoiceAddress_DTO> Addresses { get; set; }

        public List<JobWorkInvoiceGST_DTO> GST { get; set; }
    }

    public class JobInwardInvoiceGst
    {
        public Int64 TaxIndex { get; set; }
        public String? TaxCategory { get; set; }
        public String? TaxType { get; set; }
        public String? TaxElement { get; set; }
        public String? TaxElementName { get; set; }
        public String? Chargeable { get; set; }
        public String? LoadonInventory { get; set; }
        public String? LoadonInventoryPercent { get; set; }
        public Int64 Calculation { get; set; }
        public Double? Percentage { get; set; }
        public Double AssessableValue { get; set; }
        public Double Amount { get; set; }
        public long? GSTCNumber { get; set; }
        public long? GSTTNumber { get; set; }
        public long? GSTENumber { get; set; }
    }
    public class JobWorkInvoiceDetail_DTO
    {
        public long JIDNH_MS_Number { get; set; }

        public long JIDNH_WH_Number { get; set; }

        public long JIJWIH_Number { get; set; }

        public string? JIJWIH_InvoiceNo { get; set; }

        public string? JIJWIH_InvoiceDate { get; set; }

        public string? JIDNH_DN_No { get; set; }

        public string? JIDNH_DN_Date { get; set; }

        public string? CUS_Name { get; set; }

        public string? CustomerGroup { get; set; }

        public string? CustomerCategory { get; set; }

        public string? CurrencyCode { get; set; }

        public string? TaxCluster { get; set; }

        public decimal JIJWII_Qty { get; set; }

        public decimal JIJWII_Amount { get; set; }

        public decimal JIJWII_GST_Amount { get; set; }

        public string? Segregation { get; set; }

        public string? WarehouseCode { get; set; }
        public string PRS_ProcessName { get; set; }

        public string ItemGroup { get; set; }

        public string ItemCode { get; set; }

        public string ItemDescription { get; set; }

        public string OuterDia { get; set; }

        public string Thickness { get; set; }

        public string Length { get; set; }

        public string ITM_Width { get; set; }

        public string MaterialGrade { get; set; }

        public string UOM { get; set; }
    }

    public class JobWorkInvoiceSummary_DTO
    {
        public long JIJWIH_Number { get; set; }

        public string? JIJWIH_InvoiceNo { get; set; }

        public string? JIJWIH_InvoiceDate { get; set; }

        public string? JIDNH_DN_No { get; set; }
        public string? JIDNH_DN_Date { get; set; }





        public string? CUS_Name { get; set; }

        // NEW
        public string? CustomerGroup { get; set; }

        // NEW
        public string? CustomerCategory { get; set; }

        public string? CurrencyCode { get; set; }

        public string? TaxCluster { get; set; }

        public decimal TotalQty { get; set; }

        public decimal Amount { get; set; }

        public decimal GST_Amount { get; set; }

        public string? Segregation { get; set; }

        public string? WarehouseCode { get; set; }
        public string? DN_List { get; set; }
        public string? DN_Count { get; set; }
    }
}
