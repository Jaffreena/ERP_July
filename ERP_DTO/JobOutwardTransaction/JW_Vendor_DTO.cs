using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JW_Vendor_DTO
    {
        public Int64 JWV_Number { get; set; }
        public String? JWV_JW_VendorName { get; set; }
        public Int64 JWV_JVG_Number { get; set; }
        public Int64 JWV_JVC_Number { get; set; }
        public Int64 JWV_WH_Number { get; set; }
        public String? JWV_PaymentTerms { get; set; }
        public String? JWV_PaymentMode { get; set; }
        public Int32 JWV_CreditDays { get; set; }
        public Int64 JWV_Currency_Number { get; set; }
        public String? JWV_AccountName { get; set; }
        public String? JWV_AccountNumber { get; set; }
        public String? JWV_IFSC { get; set; }
        public String? JWV_BankName { get; set; }
        public Int64 JWV_RT_Number { get; set; }
        public String? JWV_GSTIN { get; set; }
        public Int64 JWV_AT_Number { get; set; }
        public Int16 JWV_TransportAgency { get; set; }
        public String? JWV_TransporterID { get; set; }
        public String? JWV_PAN { get; set; }
        public Int16 JWV_WithholdTax { get; set; }
        public Int64 JWV_AN_Number { get; set; }

        // WHT grid row
        public Int64 JWV_WHT_Number { get; set; }
        public Int64 JWV_WHT_WHTC_Number { get; set; }
        public Int64 JWV_WHT_WHTT_Number { get; set; }
        public Int64 JWV_WHT_WHT_Number { get; set; }
        public String? JWV_WHT_FromDate { get; set; }
        public String? JWV_WHT_ToDate { get; set; }

        // GST grid row
        public Int64 JWV_GST_Number { get; set; }
        public Int64 JWV_GST_GSTC_Number { get; set; }
        public Int64 JWV_GST_GSTT_Number { get; set; }
        public Int64 JWV_GST_TCT_Number { get; set; }
        public String? JWV_GST_FromDate { get; set; }
        public String? JWV_GST_ToDate { get; set; }

        // Address grid row
        public Int64 JWV_ADD_Number { get; set; }
        public Int64 JWV_ADD_ADTP_Number { get; set; }
        public String? JWV_ADD_Address_ID { get; set; }
        public String? JWV_ADD_Address { get; set; }
        public String? JWV_ADD_City { get; set; }
        public String? JWV_ADD_State { get; set; }
        public String? JWV_ADD_Country { get; set; }
        public String? JWV_ADD_PIN { get; set; }
        public String? JWV_ADD_GSTIN { get; set; }
        public Int16 JWV_ADD_Default { get; set; }

        // Contact grid row
        public Int64 JWV_CNT_Number { get; set; }
        public String? JWV_CNT_ContactName { get; set; }
        public String? JWV_CNT_Department { get; set; }
        public String? JWV_CNT_Mobile { get; set; }
        public String? JWV_CNT_Telephone { get; set; }
        public String? JWV_CNT_Email { get; set; }

        public String? JWV_DeleteNumbers { get; set; }
        public Int64 JWV_CreatorCode { get; set; }
        public Int16 JWV_Id { get; set; }

        // AJAX filters
        public String? WH_TaxCategory { get; set; }
        public String? WH_TaxType { get; set; }
        public String? GST_Category { get; set; }
        public String? GST_Type { get; set; }

        // AJAX result holders
        public String? WH_Number { get; set; }
        public String? WH_TaxCode { get; set; }
        public String? WH_TaxDescription { get; set; }
        public String? TCT_Number { get; set; }
        public String? TCT_Name { get; set; }
        public String? TCT_Description { get; set; }

        public void Reset()
        {
            JWV_Number = 0;
            JWV_JW_VendorName = "";
            JWV_JVG_Number = 0;
            JWV_JVC_Number = 0;
            JWV_WH_Number = 0;
            JWV_PaymentTerms = "";
            JWV_PaymentMode = "";
            JWV_CreditDays = 0;
            JWV_Currency_Number = 0;
            JWV_AccountName = "";
            JWV_AccountNumber = "";
            JWV_IFSC = "";
            JWV_BankName = "";
            JWV_RT_Number = 0;
            JWV_GSTIN = "";
            JWV_AT_Number = 0;
            JWV_TransportAgency = 0;
            JWV_TransporterID = "";
            JWV_PAN = "";
            JWV_WithholdTax = 0;
            JWV_AN_Number = 0;
            JWV_DeleteNumbers = "";
        }
    }

    // ---------- 2. List DTO (grid on main page) ----------
    public class JW_VendorList_DTO
    {
        public Int64 JWV_Number { get; set; }

        [Display(Name = "Vendor Name")]
        public String? JWV_JW_VendorName { get; set; }

        [Display(Name = "Currency")]
        public String? JWV_Currency_Name { get; set; }

        [Display(Name = "Vendor Group")]
        public String? JWV_JVG_Name { get; set; }

        [Display(Name = "Vendor Category")]
        public String? JWV_JVC_Name { get; set; }
    }

    // ---------- 3. Head DTO (form binding + validation) ----------
    public class JW_VendorHead_DTO : IValidatableObject
    {
        public Int64 JWV_Number { get; set; }

        [Display(Name = "Vendor Name")]
        [MaxLength(100, ErrorMessage = "Vendor Name cannot be longer than 100 characters.")]
        [Required(ErrorMessage = "Vendor Name is Required")]
        public String? JWV_JW_VendorName { get; set; }

        [Display(Name = "Vendor Group")]
        [Required(ErrorMessage = "Vendor Group is Required")]
        public Int64? JWV_JVG_Number { get; set; }

        [Display(Name = "Vendor Category")]
        [Required(ErrorMessage = "Vendor Category is Required")]
        public Int64? JWV_JVC_Number { get; set; }

        [Display(Name = "Warehouse")]
        [Required(ErrorMessage = "Warehouse is Required")]
        public Int64? JWV_WH_Number { get; set; }

        [Display(Name = "Terms of Payment")]
        [MaxLength(250, ErrorMessage = "Terms of Payment cannot be longer than 250 characters.")]
        public String? JWV_PaymentTerms { get; set; }

        [Display(Name = "Mode of Payment")]
        [MaxLength(50, ErrorMessage = "Mode of Payment cannot be longer than 50 characters.")]
        public String? JWV_PaymentMode { get; set; }

        [Display(Name = "Credit Days")]
        [Required(ErrorMessage = "Credit Days is Required")]
        [Range(0, 999, ErrorMessage = "Credit Days must be between 0 and 999")]
        public Int32? JWV_CreditDays { get; set; }

        [Display(Name = "Currency")]
        [Required(ErrorMessage = "Currency is Required")]
        public Int64? JWV_Currency_Number { get; set; }

        [Display(Name = "Account Name")]
        [MaxLength(100, ErrorMessage = "Account Name cannot be longer than 100 characters.")]
        public String? JWV_AccountName { get; set; }

        [Display(Name = "Account Number")]
        [MaxLength(25, ErrorMessage = "Account Number cannot be longer than 25 characters.")]
        public String? JWV_AccountNumber { get; set; }

        [Display(Name = "IFSC")]
        [MaxLength(25, ErrorMessage = "IFSC cannot be longer than 25 characters.")]
        public String? JWV_IFSC { get; set; }

        [Display(Name = "Bank Name")]
        [MaxLength(100, ErrorMessage = "Bank Name cannot be longer than 100 characters.")]
        public String? JWV_BankName { get; set; }

        [Display(Name = "Registration Type")]
        public Int64? JWV_RT_Number { get; set; }

        [Display(Name = "GST Number")]
        [MaxLength(15, ErrorMessage = "GST Number cannot be longer than 15 characters.")]
        public String? JWV_GSTIN { get; set; }

        [Display(Name = "Assessee Territory")]
        public Int64? JWV_AT_Number { get; set; }

        [Display(Name = "Transport Agency")]
        public Int16? JWV_TransportAgency { get; set; }

        [Display(Name = "Transporter ID")]
        [MaxLength(15, ErrorMessage = "Transporter ID cannot be longer than 15 characters.")]
        public String? JWV_TransporterID { get; set; }

        [Display(Name = "PAN / IT No.")]
        [MaxLength(10, ErrorMessage = "PAN / IT No. cannot be longer than 10 characters.")]
        public String? JWV_PAN { get; set; }

        [Display(Name = "Withhold Tax")]
        public Int16? JWV_WithholdTax { get; set; }

        [Display(Name = "Nature of Assessee")]
        public Int64? JWV_AN_Number { get; set; }

        public PaginatedList_DTO<JW_VendorList_DTO>? JW_Vendor_List { get; set; }
        public List<JW_VendorWHT_DTO>? JWV_WHT_List { get; set; }
        public List<JW_VendorGST_DTO>? JWV_GST_List { get; set; }
        public List<JW_VendorAdd_DTO>? JWV_Add_List { get; set; }
        public List<JW_VendorContact_DTO>? JWV_Contact_List { get; set; }

        public void Reset()
        {
            JWV_Number = 0;
            JWV_JW_VendorName = "";
            JWV_JVG_Number = 0;
            JWV_JVC_Number = 0;
            JWV_WH_Number = 0;
            JWV_PaymentTerms = "";
            JWV_PaymentMode = "";
            JWV_CreditDays = null;
            JWV_Currency_Number = 0;
            JWV_AccountName = "";
            JWV_AccountNumber = "";
            JWV_IFSC = "";
            JWV_BankName = "";
            JWV_RT_Number = 0;
            JWV_GSTIN = "";
            JWV_AT_Number = 0;
            JWV_TransportAgency = 0;
            JWV_TransporterID = "";
            JWV_PAN = "";
            JWV_WithholdTax = 0;
            JWV_AN_Number = 0;

            JW_Vendor_List = null;
            JWV_WHT_List = null;
            JWV_GST_List = null;
            JWV_Add_List = null;
            JWV_Contact_List = null;
        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // 1. RT / GSTIN / AT : all or none
            bool hasRT = JWV_RT_Number != null && JWV_RT_Number != 0;
            bool hasGST = !string.IsNullOrWhiteSpace(JWV_GSTIN);
            bool hasAT = JWV_AT_Number != null && JWV_AT_Number != 0;
            int filledCount = (hasRT ? 1 : 0) + (hasGST ? 1 : 0) + (hasAT ? 1 : 0);

            if (filledCount > 0 && filledCount < 3)
            {
                if (!hasRT)
                    yield return new ValidationResult("Registration Type is required.", new[] { nameof(JWV_RT_Number) });
                if (!hasGST)
                    yield return new ValidationResult("GST Number is required.", new[] { nameof(JWV_GSTIN) });
                if (!hasAT)
                    yield return new ValidationResult("Assessee Territory is required.", new[] { nameof(JWV_AT_Number) });
            }

            // 2. Address grid : Address Type + Address ID required when any field is filled
            if (JWV_Add_List != null)
            {
                foreach (var a in JWV_Add_List.Where(x => x.JWV_ADD_IsDeleted != 1))
                {
                    bool anyFilled = !string.IsNullOrWhiteSpace(a.JWV_ADD_Address)
                                  || !string.IsNullOrWhiteSpace(a.JWV_ADD_City)
                                  || !string.IsNullOrWhiteSpace(a.JWV_ADD_State)
                                  || !string.IsNullOrWhiteSpace(a.JWV_ADD_Country)
                                  || !string.IsNullOrWhiteSpace(a.JWV_ADD_PIN)
                                  || !string.IsNullOrWhiteSpace(a.JWV_ADD_GSTIN)
                                  || a.JWV_ADD_ADTP_Number != 0
                                  || !string.IsNullOrWhiteSpace(a.JWV_ADD_Address_ID);
                    if (!anyFilled) continue;

                    if (a.JWV_ADD_ADTP_Number == 0)
                        yield return new ValidationResult("Address Type is required.", new[] { "JWV_ADD_ADTP_Number" });
                    if (string.IsNullOrWhiteSpace(a.JWV_ADD_Address_ID))
                        yield return new ValidationResult("Address ID is required.", new[] { "JWV_ADD_Address_ID" });
                }
            }

            // 3. WHT grid : all columns required for non-deleted rows
            if (JWV_WHT_List != null)
            {
                foreach (var w in JWV_WHT_List.Where(x => x.JWV_WHT_IsDeleted != 1))
                {
                    if (string.IsNullOrWhiteSpace(w.JWV_WHT_WHTC_Number)
                        || string.IsNullOrWhiteSpace(w.JWV_WHT_WHTT_Number)
                        || string.IsNullOrWhiteSpace(w.JWV_WHT_WHT_Number)
                        || string.IsNullOrWhiteSpace(w.JWV_WHT_FromDate)
                        || string.IsNullOrWhiteSpace(w.JWV_WHT_ToDate))
                    {
                        yield return new ValidationResult("Withhold Tax grid: complete all fields.", new[] { "JWV_WHT_List" });
                        break;
                    }
                }
            }

            // 4. GST grid : all columns required for non-deleted rows
            if (JWV_GST_List != null)
            {
                foreach (var g in JWV_GST_List.Where(x => x.JWV_GST_IsDeleted != 1))
                {
                    if (string.IsNullOrWhiteSpace(g.JWV_GST_GSTC_Number)
                        || string.IsNullOrWhiteSpace(g.JWV_GST_GSTT_Number)
                        || string.IsNullOrWhiteSpace(g.JWV_GST_TCT_Number)
                        || string.IsNullOrWhiteSpace(g.JWV_GST_FromDate)
                        || string.IsNullOrWhiteSpace(g.JWV_GST_ToDate))
                    {
                        yield return new ValidationResult("GST grid: complete all fields.", new[] { "JWV_GST_List" });
                        break;
                    }
                }
            }
        }
    }

    // ---------- 4. Grid DTOs ----------
    public class JW_VendorWHT_DTO
    {
        public Int64 JWV_WHT_Number { get; set; }

        [Display(Name = "WHT Category")]
        public String? JWV_WHT_WHTC_Number { get; set; }

        [Display(Name = "WHT Type")]
        public String? JWV_WHT_WHTT_Number { get; set; }

        [Display(Name = "WH Tax Code")]
        public String? JWV_WHT_WHT_Number { get; set; }

        [Display(Name = "Description")]
        public String? JWV_WHT_WHT_Description { get; set; }

        [Display(Name = "From Date")]
        public String? JWV_WHT_FromDate { get; set; }

        [Display(Name = "To Date")]
        public String? JWV_WHT_ToDate { get; set; }

        public Int16 JWV_WHT_IsDeleted { get; set; }
    }

    public class JW_VendorGST_DTO
    {
        public Int64 JWV_GST_Number { get; set; }

        [Display(Name = "GST Category")]
        public String? JWV_GST_GSTC_Number { get; set; }

        [Display(Name = "GST Type")]
        public String? JWV_GST_GSTT_Number { get; set; }

        [Display(Name = "GST Tax Cluster")]
        public String? JWV_GST_TCT_Number { get; set; }

        [Display(Name = "Description")]
        public String? JWV_GST_TCT_Description { get; set; }

        [Display(Name = "From Date")]
        public String? JWV_GST_FromDate { get; set; }

        [Display(Name = "To Date")]
        public String? JWV_GST_ToDate { get; set; }

        public Int16 JWV_GST_IsDeleted { get; set; }
    }

    public class JW_VendorAdd_DTO
    {
        [Key]
        public Int64 JWV_ADD_Number { get; set; }

        [Display(Name = "Address Type")]
        public Int64 JWV_ADD_ADTP_Number { get; set; }

        [Display(Name = "Address ID")]
        [StringLength(25, ErrorMessage = "Address ID cannot exceed 25 characters")]
        public String? JWV_ADD_Address_ID { get; set; }

        [Display(Name = "Address")]
        [StringLength(250, ErrorMessage = "Address cannot exceed 250 characters")]
        public String? JWV_ADD_Address { get; set; }

        [Display(Name = "City")]
        [StringLength(25, ErrorMessage = "City cannot exceed 25 characters")]
        public String? JWV_ADD_City { get; set; }

        [Display(Name = "State")]
        [StringLength(25, ErrorMessage = "State cannot exceed 25 characters")]
        public String? JWV_ADD_State { get; set; }

        [Display(Name = "Country")]
        [StringLength(25, ErrorMessage = "Country cannot exceed 25 characters")]
        public String? JWV_ADD_Country { get; set; }

        [Display(Name = "PIN Code")]
        [StringLength(10, ErrorMessage = "PIN Code cannot exceed 10 characters")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "PIN Code must be 6 digits")]
        public String? JWV_ADD_PIN { get; set; }

        [Display(Name = "GSTIN")]
        [StringLength(15, ErrorMessage = "GSTIN cannot exceed 15 characters")]
        public String? JWV_ADD_GSTIN { get; set; }

        [Display(Name = "Default")]
        public Boolean JWV_ADD_Default { get; set; }

        public Int16 JWV_ADD_IsDeleted { get; set; }
    }

    public class JW_VendorContact_DTO
    {
        [Key]
        public Int64 JWV_CNT_Number { get; set; }

        [Display(Name = "Contact Name")]
        [StringLength(25, ErrorMessage = "Contact Name cannot exceed 25 characters")]
        public String? JWV_CNT_ContactName { get; set; }

        [Display(Name = "Department")]
        [StringLength(25, ErrorMessage = "Department cannot exceed 25 characters")]
        public String? JWV_CNT_Department { get; set; }

        [Display(Name = "Mobile")]
        [StringLength(50, ErrorMessage = "Mobile cannot exceed 50 characters")]
        public String? JWV_CNT_Mobile { get; set; }

        [Display(Name = "Telephone")]
        [StringLength(50, ErrorMessage = "Telephone cannot exceed 50 characters")]
        public String? JWV_CNT_Telephone { get; set; }

        [Display(Name = "Email")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public String? JWV_CNT_Email { get; set; }

        public Int16 JWV_CNT_IsDeleted { get; set; }
    }
}
