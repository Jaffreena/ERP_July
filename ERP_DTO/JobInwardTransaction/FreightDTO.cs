using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class FreightInvoiceHead_DTO
    {
        public long JIFTIH_Number { get; set; }

        [Display(Name = "Freight Invoice No.")]
        [StringLength(50)]
        public string JIFTIH_InvoiceNo { get; set; }

        [Display(Name = "Invoice Date")]
        [DataType(DataType.Date)]
        public DateTime JIFTIH_InvoiceDate { get; set; }

        [Display(Name = "Material Segregation")]
        public long JIFTIH_MS_Number { get; set; }

        [Display(Name = "Category")]
        [StringLength(20)]
        public string JIFTIH_SourceCategory { get; set; } = "DELIVERY NOTE";

        [Display(Name = "JW Customer")]
        public long JIFTIH_JW_Customer_Number { get; set; }
        public string JIFTIH_JW_Customer_Name { get; set; }

        [Display(Name = "Currency")]
        public long JIFTIH_Currency_Number { get; set; }

        [Display(Name = "Tax Cluster")]
        public long JIFTIH_TCT_Number { get; set; }

        [Display(Name = "Payment Terms")]
        [StringLength(50)]
        public string JIFTIH_PaymentTerms { get; set; }

        [Display(Name = "Method of payment")]
        [StringLength(50)]
        public string JIFTIH_PaymentMethod { get; set; }

        [Display(Name = "Remarks")]
        [StringLength(250)]
        public string JIFTIH_Remarks { get; set; }
    }
    public class FreightInvoiceItem_DTO
    {
        public long JIFTII_JIFTIH_Number { get; set; }

        public long JIFTII_JIDNI_Number { get; set; }

        public long JIFTII_Number { get; set; }

        [Display(Name = "Delivery Note")]
        public long JIFTII_JIDNH_Number { get; set; }

        [Display(Name = "Freight No")]
        [StringLength(50)]
        public string JIFTII_JISVOH_Number { get; set; }

        [Display(Name = "PRS Number")]
        public long JIFTII_PRS_Number { get; set; }

        [Display(Name = "Item")]
        public long JIFTII_Item_Number { get; set; }

        [Display(Name = "UOM")]
        public long JIFTII_UoM_Number { get; set; }

        [Display(Name = "Qty")]
        public double JIFTII_Qty_Kgs { get; set; }

        [Display(Name = "Rate")]
        public double JIFTII_Rate { get; set; }

        [Display(Name = "Amount")]
        public double JIFTII_Amount { get; set; }

        [Display(Name = "SAC")]
        public long JIFTII_SAC_Number { get; set; }

        [Display(Name = "GST Amount")]
        public double JIFTII_GST_Amount { get; set; }

        public long JIFTII_JISVOI_Number { get; set; }

        [StringLength(20)]
        public string JIFTII_SVO_Assign { get; set; }

        [StringLength(20)]
        public string JIFTII_SourceCategory { get; set; } = "DELIVERY NOTE";

        [Display(Name = "From Warehouse")]
        public long? JIFTII_FromWH_Number { get; set; }

        [Display(Name = "To Warehouse")]
        public long? JIFTII_ToWH_Number { get; set; }
    }
    public class FreightInvoiceAddress_DTO
    {
        public long JIFTIA_FRTIH_Number { get; set; }

        public long JIFTIA_Number { get; set; }

        [Display(Name = "Address Type")]
        public long JIFTIA_ADTP_Number { get; set; }

        [Display(Name = "Address ID")]
        [StringLength(100)]
        public string JIFTIA_Address_ID { get; set; }

        [Display(Name = "Address")]
        [StringLength(1000)]
        public string JIFTIA_Address { get; set; }

        [Display(Name = "City")]
        [StringLength(100)]
        public string JIFTIA_City { get; set; }

        [Display(Name = "State")]
        [StringLength(100)]
        public string JIFTIA_State { get; set; }

        [Display(Name = "Country")]
        [StringLength(100)]
        public string JIFTIA_Country { get; set; }

        [Display(Name = "PIN")]
        [StringLength(40)]
        public string JIFTIA_PIN { get; set; }

        [Display(Name = "GSTIN")]
        [StringLength(60)]
        public string JIFTIA_GSTIN { get; set; }
    }
    public class FreightInvoiceGST_DTO
    {
        public long JIFTIG_JIFTIH_Number { get; set; }

        public long JIFTIG_JIFTII_Number { get; set; }

        public long JIFTIG_Number { get; set; }

        [Display(Name = "Index")]
        public int JIFTIG_Index { get; set; }

        [Display(Name = "GST Category")]
        public long JIFTIG_GSTC_Number { get; set; }

        [Display(Name = "GST Type")]
        public long JIFTIG_GSTT_Number { get; set; }

        [Display(Name = "GST Element")]
        public long JIFTIG_GSTE_Number { get; set; }

        [Display(Name = "Assessable Value")]
        public double JIFTIG_AssessableValue { get; set; }

        [Display(Name = "Percent")]
        public double JIFTIG_Percent { get; set; }

        [Display(Name = "GST Amount")]
        public double JIFTIG_GST_Amount { get; set; }
    }
    public class FreightInvoiceCreate_DTO
    {
        public FreightInvoiceCreate_DTO()
        {
            Header = new FreightInvoiceHead_DTO();

            Items = new List<FreightInvoiceItem_DTO>();

            Addresses = new List<FreightInvoiceAddress_DTO>();

            GST = new List<FreightInvoiceGST_DTO>();
        }

        public FreightInvoiceHead_DTO Header { get; set; }

        public List<FreightInvoiceItem_DTO> Items { get; set; }

        public List<FreightInvoiceAddress_DTO> Addresses { get; set; }

        public List<FreightInvoiceGST_DTO> GST { get; set; }
    }

    public class FreightInvoiceDetail_DTO
    {
        public long JIFTIH_Number { get; set; }

        public string? JIFTIH_InvoiceNo { get; set; }

        public string? JIFTIH_InvoiceDate { get; set; }

        public long JIDNH_MS_Number { get; set; }

        public long JIDNH_WH_Number { get; set; }

        public string? JIDNH_DN_No { get; set; }

        public string? JIDNH_DN_Date { get; set; }

        public string? CUS_Name { get; set; }

        public string? CustomerGroup { get; set; }

        public string? CustomerCategory { get; set; }

        public string? CurrencyCode { get; set; }

        public string? TaxCluster { get; set; }
        public decimal JIFTII_Qty_Kgs { get; set; }

        public decimal JIFTII_Amount { get; set; }

        public decimal JIFTII_GST_Amount { get; set; }

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
        public string? ServiceOrderNo { get; set; }
    }

    public class FreightInvoiceSummary_DTO
    {
        public long JIFTIH_Number { get; set; }

        public string? JIFTIH_InvoiceNo { get; set; }

        public string? JIFTIH_InvoiceDate { get; set; }

        public string? DN_List { get; set; }
        public string? DN_Count { get; set; }

        public string? CUS_Name { get; set; }

        public string? CustomerGroup { get; set; }

        public string? CustomerCategory { get; set; }

        public string? CurrencyCode { get; set; }

        public string? TaxCluster { get; set; }

        public decimal TotalQty { get; set; }

        public decimal Amount { get; set; }

        public decimal GST_Amount { get; set; }

        public string? Segregation { get; set; }

        public string? WarehouseCode { get; set; }
        public string? SO_List { get; set; }
    }

    public class FRTI_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime FRTIDate { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalFRTINumber { get; set; }
        public int CreatorCode { get; set; }
    }
}
