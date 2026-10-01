using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JW_VendorCategory_DTO
    {
        public Int64 JVC_Number { get; set; }

        [Display(Name = "JW Vendor Category")]
        [Required(ErrorMessage = "JW Vendor Category is Required")]
        [MaxLength(50, ErrorMessage = "JW Vendor Category should not be longer than 50 characters.")]
        public String? JVC_JW_VendorCategory { get; set; }

        [Display(Name = "Description")]
        [MaxLength(250, ErrorMessage = "Description should not be longer than 250 characters.")]
        public String? JVC_Description { get; set; }

        // List: parent name / "Primary"  |  Form: parent Number (0 = Primary)
        [Display(Name = "Under")]
        [Required(ErrorMessage = "Under is Required")]
        public String? JVC_Under_JVC_Number { get; set; }

        public String? JVC_DeleteNumbers { get; set; }

        public Int64 JVC_CreatorCode { get; set; }

        public Int16 JVC_Id { get; set; }

        public void Reset()
        {
            this.JVC_Number = 0;
            this.JVC_JW_VendorCategory = string.Empty;
            this.JVC_Description = string.Empty;
            this.JVC_Under_JVC_Number = string.Empty;
            this.JVC_DeleteNumbers = string.Empty;
            this.JVC_CreatorCode = 0;
            this.JVC_Id = 0;
        }
    }
}
