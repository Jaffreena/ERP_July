using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JW_VendorGroup_DTO
    {
        public Int64 JVG_Number { get; set; }

        [Display(Name = "JW Vendor Group")]
        [Required(ErrorMessage = "JW Vendor Group is Required")]
        [MaxLength(50, ErrorMessage = "JW Vendor Group should not be longer than 50 characters.")]
        public String? JVG_JW_VendorGroup { get; set; }

        [Display(Name = "Description")]
        [MaxLength(250, ErrorMessage = "Description should not be longer than 250 characters.")]
        public String? JVG_Description { get; set; }

        // List: parent name / "Primary"  |  Form: parent Number (0 = Primary)
        [Display(Name = "Under")]
        [Required(ErrorMessage = "Under is Required")]
        public String? JVG_Under_JVG_Number { get; set; }

        public String? JVG_DeleteNumbers { get; set; }

        public Int64 JVG_CreatorCode { get; set; }

        public Int16 JVG_Id { get; set; }

        public void Reset()
        {
            this.JVG_Number = 0;
            this.JVG_JW_VendorGroup = string.Empty;
            this.JVG_Description = string.Empty;
            this.JVG_Under_JVG_Number = string.Empty;
            this.JVG_DeleteNumbers = string.Empty;
            this.JVG_CreatorCode = 0;
            this.JVG_Id = 0;
        }
    }
}
