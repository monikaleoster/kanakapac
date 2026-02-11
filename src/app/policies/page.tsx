export const metadata = {
  title: "PAC Policies - Kanaka PAC",
  description:
    "Bylaws, policies, and governance documents of the Kanaka Parent Advisory Council.",
};

export default function PoliciesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PAC Policies</h1>
      <p className="text-gray-600 mb-8">
        The following policies and bylaws govern the operation of the Kanaka
        Parent Advisory Council.
      </p>

      <div className="space-y-8">
        {/* Constitution & Bylaws */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Constitution &amp; Bylaws
          </h2>
          <div className="prose prose-gray max-w-none text-gray-700 space-y-4">
            <h3 className="text-lg font-semibold mt-4">Article 1 - Name</h3>
            <p>
              The name of this organization shall be the Kanaka Elementary
              Parent Advisory Council, hereinafter referred to as the
              &quot;PAC.&quot;
            </p>

            <h3 className="text-lg font-semibold mt-4">
              Article 2 - Purpose
            </h3>
            <p>The purposes of the PAC are to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Support and promote the education and well-being of students
              </li>
              <li>
                Provide a voice for parents in decisions affecting their
                children&apos;s education
              </li>
              <li>
                Foster communication between parents, teachers, and
                administration
              </li>
              <li>
                Organize and support fundraising activities for the benefit of
                the school
              </li>
              <li>
                Advise the school board and school staff on matters relating to
                the school
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">
              Article 3 - Membership
            </h3>
            <p>
              All parents and guardians of students enrolled at Kanaka
              Elementary School are automatically members of the PAC. There are
              no membership fees.
            </p>

            <h3 className="text-lg font-semibold mt-4">
              Article 4 - Executive Officers
            </h3>
            <p>The executive officers of the PAC shall consist of:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Chairperson</li>
              <li>Vice-Chairperson</li>
              <li>Treasurer</li>
              <li>Secretary</li>
              <li>Members at Large (up to 3)</li>
            </ul>
            <p>
              Officers are elected annually at the September general meeting
              and serve a one-year term. Officers may be re-elected.
            </p>

            <h3 className="text-lg font-semibold mt-4">
              Article 5 - Meetings
            </h3>
            <p>
              General meetings shall be held monthly during the school year,
              typically on the first Wednesday of each month. The executive may
              call special meetings as needed with at least 48 hours notice to
              members.
            </p>
            <p>
              Quorum for general meetings shall be 10 members. Quorum for
              executive meetings shall be a majority of executive officers.
            </p>

            <h3 className="text-lg font-semibold mt-4">
              Article 6 - Finances
            </h3>
            <p>
              All funds raised by the PAC shall be used for the benefit of
              students at Kanaka Elementary. The Treasurer shall maintain
              accurate financial records and present a report at each general
              meeting. An annual financial statement shall be prepared at the
              end of each school year.
            </p>
          </div>
        </section>

        {/* Code of Conduct */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Code of Conduct
          </h2>
          <div className="prose prose-gray max-w-none text-gray-700 space-y-3">
            <p>
              All PAC members, volunteers, and participants are expected to:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                Treat all individuals with respect, dignity, and courtesy
              </li>
              <li>
                Act in the best interests of all students at the school
              </li>
              <li>
                Respect the confidentiality of discussions and personal
                information
              </li>
              <li>
                Follow established procedures for raising concerns and
                resolving conflicts
              </li>
              <li>
                Support decisions made by the majority, even when personally
                disagreeing
              </li>
              <li>
                Refrain from personal attacks, gossip, or disruptive behavior
              </li>
              <li>
                Declare any conflicts of interest in PAC business
              </li>
            </ul>
          </div>
        </section>

        {/* Volunteer Policy */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Volunteer Policy
          </h2>
          <div className="prose prose-gray max-w-none text-gray-700 space-y-3">
            <p>
              The PAC appreciates and relies on parent volunteers. All
              volunteers working directly with students must:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Complete a Criminal Record Check as required by the school district</li>
              <li>Sign a volunteer agreement form</li>
              <li>Follow all school policies and procedures</li>
              <li>Report to the supervising teacher or PAC coordinator</li>
              <li>Maintain confidentiality regarding student information</li>
            </ul>
            <p>
              Volunteer hours are tracked and recognized at the year-end PAC
              appreciation event.
            </p>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h2>
          <div className="prose prose-gray max-w-none text-gray-700 space-y-3">
            <p>
              The PAC is committed to protecting the privacy of its members.
              Personal information collected by the PAC (such as names, email
              addresses, and phone numbers) will only be used for PAC-related
              communications and activities. Member information will not be
              shared with third parties without consent.
            </p>
            <p>
              Photos and videos taken at PAC events may be used on the PAC
              website and communications. Parents who do not wish their
              children to be photographed should notify the PAC in writing.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
